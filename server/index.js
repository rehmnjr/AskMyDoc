import express from 'express'
import cors from 'cors'
import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.filename}`)
  }
})

const upload = multer({ storage: storage })


const app = express();
app.use(cors());
const PORT = 8000;

app.get('/',(req,res)=>{
    res.send("I'm working ..");
});

app.post('/upload/pdf',upload.single('pdf'),(req,res)=>{
    return  res.json({message:'PDF Uploaded'});
})

app.listen(PORT, ()=>{
    console.log(PORT,"Listening ...");
})