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
3. Clerk.com account for authentication (sign up at https://clerk.com)

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
   - For the frontend service, you'll need to set:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
     - `CLERK_SECRET_KEY`: Your Clerk secret key

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
     - `NEXT_PUBLIC_API_URL`: The URL of your backend service (e.g., `https://askmydoc-backend-lr1q.onrender.com`)
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
     - `CLERK_SECRET_KEY`: Your Clerk secret key

## Local Development

### Backend

1. Navigate to the backend directory: `cd backend`
2. Create a `.env` file based on `.env.example`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

### Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Create a `.env.local` file based on `.env.example` with the following variables:
   - `NEXT_PUBLIC_API_URL`: URL of your backend (e.g., `http://localhost:5000`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Troubleshooting

### Common Issues

1. **"Not Found" error on frontend**
   - Ensure Clerk authentication is properly configured with valid API keys
   - Check that you've set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
   - Verify that your Clerk application settings allow the deployed domain

2. **"Cannot GET /" error on backend**
   - This should be fixed with the root route handler, but if it persists, check your backend logs
   - Ensure the backend service is properly deployed and running

3. **CORS errors in console**
   - Verify that the backend CORS configuration includes your frontend URL without a trailing slash
   - Check that the `NEXT_PUBLIC_API_URL` in your frontend environment points to the correct backend URL

4. **Authentication issues**
   - Make sure you've created a Clerk application and configured the authentication properly
   - Check that your Clerk application's allowed URLs include your deployed frontend URL

## License

ISC