'use client';
import Navbar from './navbar';
import bgImage from './assests/bg.jpg';
import UploadPanel from './uploadPanel'

export default function Home() {
  return (
    <div
      className="h-screen w-screen"
      style={{
        backgroundImage: `url(${bgImage.src || bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>

      <Navbar />

      <div className="relative mt-3 flex flex-col md:flex-row w-full px-3 gap-3 h-[calc(100vh-6rem)]">
        <div className="absolute inset-0 mx-3 rounded-2xl bg-[#00000094] z-0" />

        {/* Upload Area */}
       <UploadPanel/>

        {/* Chat Panel */}
        <div className="w-full md:w-2/3 h-full border border-white/20 rounded-2xl backdrop-blur-md bg-white/5 z-10 p-4 text-white">
          Right
        </div>
      </div>
    </div>
  );
}
