const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Document } = require('@langchain/core/documents');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://askmydoc-pi.vercel.app/'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint for Render.com
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AskMyDoc API is running',
    endpoints: {
      health: '/health',
      status: '/api/status',
      upload: '/api/upload',
      query: '/api/query'
    }
  });
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Initialize vector store
let vectorStore = null;

// --- PREDEFINED AI PDF CONTENT FOR INITIALIZATION (CORRECTLY PLACED) ---
const aiPdfInitialDocuments = [
  new Document({
    pageContent: `A Brief Introduction to Artificial Intelligence
What is Al and how is it going to shape the future
By Dibbyo Saha, Undergraduate Student, Computer Science, Ryerson University
What is Artificial Intelligence?
Image by Gerd Altmann from Pixabay
Generally speaking, Artificial Intelligence is a computing concept that helps a machine think and solve complex problems as we humans do with our intelligence.
For example, we perform a task, make mistakes and learn from our mistakes (At least the wise ones of us do!).
Likewise, an Al or Artificial Intelligence is supposed to work on a problem, make some mistakes in solving the problem and learn from the problems in a self-correcting manner as a part of its self-improvement.
Or in other words, think of this like playing a game of chess.
Every bad move you make reduces your chances of winning the game.
So, every time you lose against your friend, you try remembering the moves you made which you shouldn't have and apply that knowledge in your next game and so on.
Eventually, you get better and your precision, or in this case probability of winning or solving a problem`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 1 },
  }),
  new Document({
    pageContent: `improves by a noteworthy extent. Al is programmed to do something similar to that!
Artificial Intelligence vs Traditional Robotics
Photo by Possessed Photography on Unsplash
When we hear the word "Robot", an image of a metal box with creepy eyes and speaking in a mechanical voice pops into our head.
I mean that's what we have been watching in television for years, isn't it?
And to a certain degree we are right.
Traditional robotics has been perceived by pop culture as an arena that creates humanlike machines to work for us as saviours and sometimes as super-villains bringing in a cascade of tyranny into the human world.
However, real life robots aren't as humanlike as we want them to be, yet.
They are programmed in a specific way to only execute tasks that it has been programmed to perform.
Imagine a self-driving car that has been designed to drive you on its own according to where you instruct it to take you.
Now for a traditional robot, the car is going to go through the exact road that it was programmed to select for a certain destination by its creators, possibly without the knowledge of traffic and cause accidents.
However, a human driver would have chosen the shortest path or check which paths have the least traffic today and would be the most convenient path for that particular destination.
That is the exact humanlike creative thinking the traditional robots lack!
They are fixed in their own "not so smart" way and are largely dependent on the program they are built on and the instructions that they are being given.
If a certain instruction doesn't coincide with their program, the robot won't even be able to run, let alone going the extra step of being creative.
This is the limitation of traditional robots Artificial Intelligence is being developed to overcome.
Unlike the conventional "bips and bops", a good Al will simulate the`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 2 },
  }),
  new Document({
    pageContent: `complicated and intuitive sense of thinking and problem-solving abilities of the human mind.
A Brief History of AI
The concept of Artificial Intelligence is not as modern as we think it is.
This traces back to as early as 1950 when Alan Turing invented the Turing test.
Then the first chatbot computer program, ELIZA, was created in the 1960s.
[1 IBM deep blue was a chess computer made in 1977 beat a world chess champion in two out of six games, one won by the champion and the other three games were draw.
121 In 2011, Siri was announced as a digital assistant by Apple.
[3] Elon Musk and some others founded OpenAI in 2015. 4 [5]
Artificial Intelligence vs Machine Learning vs Deep Learning
Image by Gerd Altmann from Pixabay
Up until now in this article we were discussing about Artificial Intelligence as a process that is going to help machines achieve a humanlike mental behaviour.
Al is a vast and growing field which also includes a lot more subfields like machine learning and deep learning and so on.
Machine learning is in a nutshell the concept of computers learning to improve their predictions and creativity to resemble a humanlike thinking process using algorithms.
Machine learning involves a number of learning processes such as:
Supervised learning: Supervised learning is a process where our machines are designed to learn with the feeding of labelled data.
In this process our machine`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 3 },
  }),
  new Document({
    pageContent: `is being trained by giving it access to a huge amount of data and training the machine to analyze it.
For instance, the machine is given a number of images of dogs taken from many different angles with colour variations, breeds and many more diversity.
So that, the machine learns to analyze data from these diverse images of dogs and the "insight" of machines keep increasing and soon the machine can predict if it's a dog from a whole different picture which was not even a part of the labelled data set of dog images the machine was fed earlier.
Unsupervised learning: Contrary to the supervised learning, the unsupervised learning algorithms comprises analyzing unlabelled data i.e., in this case we are training the machine to analyze and learn from a series of data, the meaning of which is not apparently comprehendible by the human eyes.
The machine looks for patterns and draws conclusions on its own from the patterns of the data.
Important thing to remember that the dataset used in this instance is not labelled and the conclusions are drawn by the machines.
Reinforcement learning: Reinforcement learning is a feedback dependent machine learning model.
In this process the machine is given a data and made to predict what the data was.
If the machine generates an inaccurate conclusion about the input data, the machine is given feedback about its incorrectness.
For example, if you give the machine an image of a basketball and it identifies the basketball as a tennis ball or something else, you give a negative feedback to the machine and eventually the machine learns to identify an image of a basketball on its own when it comes across a completely different picture of a basketball.
Meaningful Compression
Structure Discovery
Image Classification
Customer Retention
Big data Visualistaion
Dimensionality Rieduction
Feature Elicitation
Idenity Fraud Detection
Classification
Diagnostics
Advertising Popularity Prediction
Weather Forecasting
Recommender Systems
Unsupervised Learning
Supervised Learning
Clustering
Targeted Markeong
Machine Learning
Regression
Population Growth Prediction
Customer Segmentation
Learning Real-time decisions
Game Al
Reinforcement Learning
Robot Navigation
Skill Acquisition
Learning Tasks
Estimating Market Forecasting
life expectancy`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 4 },
  }),
  new Document({
    pageContent: `Source:http://datasciencecentral.com
Deep Learning, on the other hand is the concept of computers simulating the process a human brain takes to analyze, think and learn.
The deep learning process involves something called a neural network as a part of the thinking process for an AI.
It takes an enormous amount of data to train deep learning and a considerably powerful computing device for such computation methods.
AI at Work Today
amazon
Photo by Dan Seifert / The Verge
The most common examples of uses of Artificial Intelligence can be found today in smart personal assistants like Apple's Siri and Amazon's Alexa.
People interact with these devices to command them on a daily basis and these devices use the commands as a part of their dataset to learn from.
Another known example of Artificial Intelligence is the use of algorithms in Netflix.
Netflix provides very much accurate and relevant suggestions of movies, tv series from our data which is created every time we stream or click on something in Netflix.
As the dataset for these systems grows, their accuracy and precision increase as well. Artificial`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 5 },
  }),
  new Document({
    pageContent: `Intelligence is also viewed as a great tool for better cybersecurity.
Many banks are using Al as a means to identify unauthorized credit cards uses.
From analyzing complex genetic data to perform the most delicate surgeries at the highest precision is also being worked on to integrate with AI.
We all know about companies like Tesla and Apple working to make flawless self-driving cars which is going to have game changing impacts on the future of transportation.
Concerns about Al
One of the most immediate concerns about Artificial Intelligence is the fear of losing jobs.
Artificial Intelligence enhancing automation is also causing huge job losses around the world.
According to a Forbes article, it is predicted that by 2025 automation will cause a loss of 85 million jobs.
161 Bigger fears regarding AI includes the scenario whereas machines become smarter and smarter they going to end up being as opinionated and biased like some of the people training it.
Automatization of weapons is also a big reason people worry about the future of Artificial Intelligence.
The idea that weapons can be used to search and target someone with pre-programmed instructions and the misuse of this by governments or mafias or rogue Al can be something very deadly and devastating.
However, there are many myths in disguise of concerns surrounding AI that spreads panic and misinformation.
Al today is nowhere near to become a super-intelligent entity and turn into our overlords like in sci-fi movies.
However, heavy regulations and cautions are being advised by Big Tech giants like Elon Musk while developing this industry.
Artificial Intelligence and The Future
It is said that AI is the greatest thing humankind has ever worked on.
Al is also improving and creating new opportunities in agriculture, education, transportation, finance, biotechnology, cybersecurity, gaming etc. As new businesses are being created so are new jobs. Many existing jobs are becoming redefined and more specialized which is really important for the new world to prosper and advance.
Towards Conclusion...
The growth of Artificial Intelligence in recent times has been exponential. We cannot even imagine how big and impactful Al is going to be in the near future and how drastically it is going to change and upgrade the world we live in today. There are a lot more to learn about AI and its rapidly growing applications in our life. I believe it would be wise to adapt to this changing world and acquire skills related to Artificial Intelligence and technology. Just like AI learns and develops, we should too - to make this world a better place.

References:
https://news.harvard.edu/gazette/story/2012/09/alan-turing-at-100/
[2 https://www.ibm.com/ibm/history/ibm100/us/en/icons/deepblue/
[3] https://www.firstpost.com/tech/news-analysis/siri-google-now-and-cortana-how-
digital-assistants-predict-what-you-need-3671725.html
[4 https://openai.com/blog/introducing-openai/
[5]https://www.bbc.com/news/technology-35082344
[6 https://www.forbes.com/sites/jackkelly/2020/10/27/
`,
    metadata: { source: "A_Brief_Introduction_To_AI.pdf", page: 6 },
  }),
];




async function processPdf(filePath) {
  try {
    // Load PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Create embeddings using Google's Gemini API
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "embedding-001",
    });

    // Create or update vector store
    if (vectorStore) {
      await vectorStore.addDocuments(splitDocs);
    } else {
      vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
      // Save the vector store
      const directory = path.join(__dirname, 'vectorstore');
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      await vectorStore.save(directory);
    }

    return { success: true, chunks: splitDocs.length };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return { success: false, error: error.message };
  }
}

// Load existing vector store OR initialize with dummy data
async function loadVectorStore() {
  const directory = path.join(__dirname, 'vectorstore');
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "embedding-001",
  });

  // Check if vectorstore directory exists and is not empty
  const vectorstoreFilesExist = fs.existsSync(directory) && fs.readdirSync(directory).length > 0;

  if (vectorstoreFilesExist) {
    try {
      vectorStore = await HNSWLib.load(directory, embeddings);
      console.log('Vector store loaded from disk successfully.');
    } catch (error) {
      console.error('Error loading vector store from disk. Initializing with AI PDF data instead:', error);
      // Fallback to AI PDF data if loading fails
      vectorStore = await HNSWLib.fromDocuments(aiPdfInitialDocuments, embeddings);
      console.log('Vector store initialized with AI PDF data.');
      // Save the AI PDF data to disk for future runs
      await vectorStore.save(directory);
      console.log('AI PDF vector store saved to disk.');
    }
  } else {
    // If no existing vectorstore directory or it's empty, initialize with AI PDF data
    vectorStore = await HNSWLib.fromDocuments(aiPdfInitialDocuments, embeddings);
    console.log('Vector store initialized with AI PDF data (no prior vectorstore found or empty).');
    // Save the AI PDF data to disk for future runs
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    await vectorStore.save(directory);
    console.log('AI PDF vector store saved to disk.');
  }
}


// Initialize Gemini model
function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const result = await processPdf(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  if (!vectorStore) {
    return res.status(400).json({ success: false, message: 'No documents have been loaded/processed yet' });
  }

  try {
    // Search for relevant documents
    const results = await vectorStore.similaritySearch(query, 5);

    // Generate response using Gemini
    const model = getGeminiModel();
    const context = results.map(doc => doc.pageContent).join('\n\n');

    const prompt = `
    You are an AI assistant that helps users find information in their documents.

    CONTEXT INFORMATION:
    ${context}

    USER QUERY: ${query}

    Strictly use ONLY the provided CONTEXT INFORMATION to answer the user's query.
    DO NOT use any outside knowledge.
    If the answer cannot be found in the context, politely state that you don't have that information.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({
      success: true,
      answer: response,
      sources: results.map(doc => ({
        content: doc.pageContent.substring(0, 150) + '...',
        metadata: doc.metadata
      }))
    });
  } catch (error) {
    console.error('Error querying documents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    message:"Backend is running....",
    success: true,
    hasDocuments: vectorStore !== null,
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Handle process errors to prevent server from crashing
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await loadVectorStore();
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Error during server initialization:', error);
  }
});

server.on('error', (error) => {
  console.error('Server error:', error);
});