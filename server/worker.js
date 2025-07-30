// worker.js

import { Worker } from "bullmq";
import { LlamaParse } from "llama-parse";
import { File } from "formdata-node";
import 'dotenv/config';
import fs from "fs";
import path from "path";


// PDF parsing function
const parsePdf = async (pdfPath) => {
  const parser = new LlamaParse({
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
  });

  const buffer = fs.readFileSync(pdfPath);
  const file = new File([buffer], path.basename(pdfPath), { type: "application/pdf" });

  const result = await parser.parseFile(file);
  console.log("---- Parsed Markdown ----");
  console.log(result.markdown);

  return result.markdown; 
};

// BullMQ worker setup
const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("Job received:", job.name);
      const { path: filePath } = job.data;

      if (!filePath) {
        throw new Error("No file path found in job data.");
      }

      const markdown = await parsePdf(filePath);
      console.log("Parsing complete!", markdown);

    } catch (error) {
        console.log(process.env.LLAMA_CLOUD_API_KEY);
      console.error("Error in worker job:", error.message);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

export default worker;
