# AskMyDoc

AskMyDoc is a document question-answering application that allows users to upload PDF documents and ask questions about their content. The application uses AI to analyze the documents and provide relevant answers.

## Project Structure

The project consists of two main parts:

1. **Backend**: A Node.js Express server that handles document processing, vector storage, and AI-powered question answering.
2. **Frontend**: A Next.js application that provides the user interface for document upload and chat interaction.

## Deployment on Render.com

This project is configured for easy deployment on Render.com using the `render.yaml` file.

### Prerequisites

1. A Render.com account
2. A Google Gemini API key

### Deployment Steps

1. **Fork or clone this repository to your GitHub account**

2. **Set up a new Blueprint on Render.com**:
   - Log in to your Render.com account
   - Go to the Dashboard and click "New Blueprint"
   - Connect your GitHub account and select the repository
   - Render will automatically detect the `render.yaml` file and set up the services

3. **Configure environment variables**:
   - For the backend service, you'll need to set:
     - `GEMINI_API_KEY`: Your Google Gemini API key

4. **Deploy the services**:
   - Render will automatically deploy both the frontend and backend services
   - The backend API will be available at `https://askmydoc-backend.onrender.com`
   - The frontend application will be available at `https://askmydoc-frontend.onrender.com`

## Manual Deployment

If you prefer to deploy the services manually:

### Backend Deployment

1. Create a new Web Service on Render.com
2. Connect your repository
3. Configure the service:
   - **Name**: `askmydoc-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**:
     - `PORT`: `10000`
     - `GEMINI_API_KEY`: Your Google Gemini API key

### Frontend Deployment

1. Create a new Web Service on Render.com
2. Connect your repository
3. Configure the service:
   - **Name**: `askmydoc-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL`: The URL of your backend service (e.g., `https://askmydoc-backend.onrender.com`)

## Local Development

### Backend

1. Navigate to the backend directory: `cd backend`
2. Create a `.env` file based on `.env.example`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

### Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Create a `.env.local` file based on `.env.example`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## License

ISC