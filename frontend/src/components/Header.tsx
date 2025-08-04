import React from 'react';
import {UserButton,useUser} from '@clerk/nextjs';
import logoIcon from '../app/assests/IconLogo.png'
import logo from '../app/assests/logo.png'




const Header: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }
  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">

        <img src={logoIcon.src} alt={'logoIcon'} width={30}/>
        <img src={logo.src} alt={'logo'} width={140}/>
      </div>
      <div className="flex items-center space-x-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors"
        >
          <div className='flex  items-center text-[12px] space-x-3'>
          <UserButton/>
          <p>Hi, {user.firstName}</p>
          </div>
        </a>
      </div>
    </header>
  );
};

export default Header;