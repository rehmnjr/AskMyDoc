# Clerk Authentication Setup Guide

## Overview

This guide explains how to properly set up Clerk authentication for the AskMyDoc application, addressing the common error:

```
Clerk: The <SignUp/> component is not configured correctly. The most likely reasons for this error are:

1. The "/" route is not a catch-all route.
It is recommended to convert this route to a catch-all route, eg: "//[[...rest]]/page.tsx".

2. The <SignUp/> component is mounted in a catch-all route, but all routes under "/" are protected by the middleware.
```

## Changes Made to Fix the Issue

1. **Implemented Catch-All Route**
   - Created a `[[...sign-in]]` directory in `frontend/src/app/`
   - Moved the main page content to this directory
   - This pattern ensures Clerk can handle authentication paths properly

2. **Updated Middleware Configuration**
   - Modified `frontend/src/middleware.ts` to:
     - Import `createRouteMatcher` from Clerk
     - Add debug mode for development
     - Include the `/(.*)'` pattern in the matcher to ensure catch-all routes work properly

## Clerk Dashboard Configuration

1. **Sign in to your Clerk Dashboard**: https://dashboard.clerk.com

2. **Select your application** or create a new one

3. **Configure Application URLs**:
   - Go to **Settings** > **Application URLs**
   - Add your frontend URL to the list of allowed URLs:
     - For production: `https://askmydoc-frontend.onrender.com`
     - For development: `http://localhost:3000`

4. **Configure Redirect URLs**:
   - Set the following redirect URLs:
     - **Sign-in URL**: `/`
     - **Sign-up URL**: `/`
     - **After sign-in URL**: `/`
     - **After sign-up URL**: `/`

5. **Get API Keys**:
   - Go to **Settings** > **API Keys**
   - Copy your **Publishable Key** and **Secret Key**

## Environment Variables

1. **For Local Development**:
   - In `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:10000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

2. **For Render.com Deployment**:
   - In Render Dashboard, set the following environment variables for the frontend service:
   ```
   NEXT_PUBLIC_API_URL=https://askmydoc-backend-lr1q.onrender.com
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

## Testing Authentication

1. **Local Testing**:
   - Run the frontend: `cd frontend && npm run dev`
   - Navigate to `http://localhost:3000`
   - You should see the Clerk sign-up form
   - After signing up, you should be redirected to the main application

2. **Production Testing**:
   - Deploy your application to Render.com
   - Navigate to your frontend URL (e.g., `https://askmydoc-frontend.onrender.com`)
   - Verify that authentication works correctly

## Troubleshooting

1. **"Not Found" Error**:
   - Check that your Clerk API keys are correctly set in environment variables
   - Verify that your deployed domain is added to the allowed URLs in Clerk dashboard

2. **Redirect Issues**:
   - Ensure your redirect URLs are correctly configured in Clerk dashboard
   - Check that the catch-all route is properly implemented

3. **Middleware Errors**:
   - Enable debug mode in middleware to see detailed logs
   - Verify that the matcher patterns are correctly configured

4. **CORS Issues**:
   - Ensure the backend CORS configuration includes your frontend URL