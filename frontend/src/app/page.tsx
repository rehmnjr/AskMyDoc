'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';
import bgImage from './assests/bg.jpg'
import { FileText, Upload, MessageSquare } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [hasDocuments, setHasDocuments] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_UR;
        console.log('Checking backend status at:', apiUrl);
        
        const response = await axios.get(
          `${apiUrl}/api/status`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000 // 5 second timeout
          }
        );
        
        console.log('Backend status response:', response.data);
        setHasDocuments(response.data.hasDocuments);
      } catch (error: unknown) {
          console.error('Error checking status:', error);
          if (axios.isAxiosError(error)) {
              console.error('Axios error:', error.message);
              if (error.code === 'ECONNABORTED' || !error.response) {
                  console.error('Backend server might not be running');
              }
          }else{
            console.error('Unknown error:', error);
          }
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleUploadSuccess = () => {
    setHasDocuments(true);
    setActiveTab('chat');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: `url(${bgImage.src})`,backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-8xl mx-auto">
          <div className="bg-[#000000be] rounded-lg shadow-xl overflow-hidden border border-gray-800">
            <div className="flex border-b border-gray-800">
              <button
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 transition-colors ${activeTab === 'upload' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload className="h-5 w-5" />
                <span>Upload PDF</span>
              </button>
              <button
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 transition-colors ${activeTab === 'chat' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                onClick={() => setActiveTab('chat')}
                disabled={!hasDocuments && !loading}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
              </button>
            </div>
            
            <div className="p-6 min-h-[68vh]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>) : activeTab === 'upload' ? ( <div className="py-6">
                  <div className="text-center mb-8">
                    <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />

                    <h2 className="text-2xl font-bold text-white mb-2">Upload Your PDF Document</h2>
                    
                  </div><FileUpload onUploadSuccess={handleUploadSuccess} /></div>

              ) : ( <div className="py-4 h-[600px]"> <ChatInterface hasDocuments={hasDocuments} /> </div>)}

            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
