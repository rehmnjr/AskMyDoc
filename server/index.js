import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from "bullmq";


const app = express();

app.use(cors());

const PORT = 8000;


const queue = new Queue("file-upload-queue",{connection: {
      host: "localhost",
      port: 6379,
    },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({ storage: storage })


app.get('/',(req,res)=>{
    res.send("I'm working ..");
});

app.post('/upload/pdf',upload.single('pdf'), async (req,res)=>{
    await queue.add('file-ready',{
        filename : req.file.originalname,
        destination : req.file.destination,
        path : req.file.path,
    });
    return  res.json({message:'PDF Uploaded'});
});

app.listen(PORT, ()=>{
    console.log(PORT,"Listening ...");
})