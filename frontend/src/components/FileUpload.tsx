'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import axios, {AxiosError} from 'axios';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus({
        success: false,
        message: 'Only PDF files are allowed',
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Uploading PDF to:', apiUrl);
      
      const response = await axios.post(
        `${apiUrl}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for larger files
        }
      );

      console.log('Upload response:', response.data);
      
      if (response.data && response.data.success) {
        setUploadStatus({
          success: true,
          message: `Successfully processed PDF with ${response.data.chunks} chunks`,
        });
        onUploadSuccess();
      } else {
        setUploadStatus({
          success: false,
          message: response.data?.message || 'Failed to process PDF',
        });
      }
    }catch (err: unknown) {
      let errorMessage = 'Error uploading file. Please try again.';
        
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError<{ message?: string }>;
      
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timed out. The server might be busy or the file is too large.';
        } else if (error.response) {
          if (error.response.status === 413) {
            errorMessage = 'The file is too large. Maximum size is 10MB.';
          } else {
            errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
      }
    
      console.error('Error uploading file:', err);
      setUploadStatus({
        success: false,
        message: errorMessage,
      });
}finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 bg-opacity-10'
            : 'border-gray-700 hover:border-gray-500'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {uploading ? (
            <div className="animate-pulse">
              <File className="h-12 w-12 text-blue-500 mb-2" />
              <p className="text-gray-300">Uploading and processing PDF...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-blue-500 mb-2" />
              <p className="text-gray-300">
                {isDragActive
                  ? 'Drop the PDF file here'
                  : 'Drag & drop a PDF file here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Only PDF files are supported (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-md ${
            uploadStatus.success ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {uploadStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm ${
                  uploadStatus.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {uploadStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;