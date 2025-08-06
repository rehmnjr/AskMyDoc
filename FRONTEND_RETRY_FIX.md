# Frontend Retry Mechanism for AskMyDoc

## Problem

When using Render.com's free tier for the backend service, the service spins down after 15 minutes of inactivity and can take up to a minute to spin back up when a new request comes in. During this spin-up period, the frontend receives CORS errors or timeout errors, leading to a poor user experience.

## Solution

Implement a retry mechanism with exponential backoff in the frontend to handle backend spin-up delays gracefully.

## Implementation

Here's how to modify your frontend code to handle backend spin-up delays:

### 1. Create a Retry Utility

Create a new file at `frontend/src/utils/apiRetry.ts`:

```typescript
// frontend/src/utils/apiRetry.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryStatusCodes: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000, // Start with a 1-second delay
  maxDelayMs: 30000, // Maximum delay of 30 seconds
  backoffFactor: 2, // Exponential backoff factor
  retryStatusCodes: [0, 408, 429, 500, 502, 503, 504], // Status codes to retry
};

// Sleep function for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate delay with exponential backoff
const calculateDelay = (retryCount: number, config: RetryConfig): number => {
  const delay = config.initialDelayMs * Math.pow(config.backoffFactor, retryCount);
  return Math.min(delay, config.maxDelayMs);
};

// Function to make API requests with retry logic
export const apiRequestWithRetry = async <T>(
  requestConfig: AxiosRequestConfig,
  retryConfig: Partial<RetryConfig> = {}
): Promise<AxiosResponse<T>> => {
  const config: RetryConfig = { ...defaultRetryConfig, ...retryConfig };
  let lastError: AxiosError | Error = new Error('Unknown error');
  
  for (let retryCount = 0; retryCount <= config.maxRetries; retryCount++) {
    try {
      // If not the first attempt, log retry information
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount}/${config.maxRetries}...`);
      }
      
      // Make the request
      const response = await axios(requestConfig);
      return response;
    } catch (error) {
      lastError = error as AxiosError | Error;
      
      // Check if we should retry based on the error
      const shouldRetry = (
        retryCount < config.maxRetries && 
        (axios.isAxiosError(error) && (
          // Network errors (no response)
          !error.response ||
          // Status code based retries
          (error.response && config.retryStatusCodes.includes(error.response.status))
        ))
      );
      
      if (!shouldRetry) {
        break;
      }
      
      // Calculate delay for exponential backoff
      const delayMs = calculateDelay(retryCount, config);
      console.log(`Backend might be spinning up. Retrying in ${delayMs/1000} seconds...`);
      
      // Wait before the next retry
      await sleep(delayMs);
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
};

// Create an axios instance with retry capability
export const createRetryAxiosInstance = (baseURL: string, retryConfig?: Partial<RetryConfig>) => {
  const instance = axios.create({ baseURL });
  
  // Request interceptor (optional, for additional functionality)
  instance.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
  );
  
  // Response interceptor (optional, for additional functionality)
  instance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
  );
  
  // Add retry method to the instance
  const enhancedInstance = instance as typeof instance & {
    requestWithRetry: typeof apiRequestWithRetry;
  };
  
  enhancedInstance.requestWithRetry = <T>(config: AxiosRequestConfig) => 
    apiRequestWithRetry<T>({
      ...config,
      baseURL: instance.defaults.baseURL,
    }, retryConfig);
  
  return enhancedInstance;
};
```

### 2. Create an API Service with Retry Logic

Create or modify your API service file at `frontend/src/services/api.ts`:

```typescript
// frontend/src/services/api.ts
import { createRetryAxiosInstance } from '../utils/apiRetry';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://askmydoc-backend-lr1q.onrender.com';

// Create an axios instance with retry capability
const apiClient = createRetryAxiosInstance(API_URL, {
  maxRetries: 5,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
});

// API functions
export const checkStatus = async () => {
  try {
    const response = await apiClient.requestWithRetry({
      url: '/api/status',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    console.error('Error checking status:', error);
    throw error;
  }
};

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  try {
    const response = await apiClient.requestWithRetry({
      url: '/api/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const queryDocument = async (query: string) => {
  try {
    const response = await apiClient.requestWithRetry({
      url: '/api/query',
      method: 'POST',
      data: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Error querying document:', error);
    throw error;
  }
};
```

### 3. Add a Loading State Component

Create a loading state component at `frontend/src/components/BackendStatus.tsx`:

```tsx
// frontend/src/components/BackendStatus.tsx
import React, { useState, useEffect } from 'react';
import { checkStatus } from '../services/api';

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState('Checking backend status...');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await checkStatus();
        setStatus('online');
      } catch (error) {
        if (retryCount > 0) {
          setMessage(`Backend is starting up. This may take up to a minute...`);
        } else {
          setMessage('Connecting to backend...');
        }
        setStatus('offline');
      }
    };

    checkBackendStatus();
  }, [retryCount]);

  // If backend is offline, show a message
  if (status === 'offline') {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-2 text-center">
        <p className="text-yellow-800">
          {message}
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="ml-2 underline text-blue-600 hover:text-blue-800"
          >
            Retry Now
          </button>
        </p>
      </div>
    );
  }

  // If backend is loading or online, don't show anything
  return null;
};

export default BackendStatus;
```

### 4. Add the Status Component to Your Layout

Add the `BackendStatus` component to your main layout or pages:

```tsx
// frontend/src/app/layout.tsx or similar
import BackendStatus from '../components/BackendStatus';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BackendStatus />
        {children}
      </body>
    </html>
  );
}
```

## Benefits

1. **Improved User Experience**: Users will see a helpful message instead of cryptic CORS errors
2. **Automatic Retries**: The frontend will automatically retry requests when the backend is spinning up
3. **Exponential Backoff**: Prevents overwhelming the backend with too many requests during spin-up
4. **Transparent Feedback**: Users understand what's happening when there's a delay

## Testing

To test this implementation:

1. Deploy the updated frontend to Vercel
2. Wait for the backend to spin down (15+ minutes of inactivity)
3. Visit your application and observe the retry mechanism in action

## Additional Considerations

1. **Keep-Alive Strategy**: Consider implementing a periodic ping to keep the backend active during expected usage periods
2. **Caching**: Implement caching for frequently accessed data to reduce backend calls
3. **Upgrade to Paid Tier**: For production use, consider upgrading to a paid tier on Render.com to avoid spin-down/up delays

By implementing these changes, your application will handle the free tier limitations of Render.com more gracefully, providing a better user experience even when the backend needs to spin up.