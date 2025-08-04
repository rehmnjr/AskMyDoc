import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-2 px-6 text-center text-gray-400 text-sm">
      <div className="flex items-center justify-center space-x-4">
        <p>© {new Date().getFullYear()} AskMyDoc</p>
        <span className="text-gray-600">|</span>
        <a
          href="https://github.com/rehmnjr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>
        <p className="text-xs text-gray-600">
        Built with Next.js, Express, and Gemini
      </p>
      </div>
      
    </footer>
  );
};

export default Footer;