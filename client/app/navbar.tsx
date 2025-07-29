// components/Navbar.tsx
import { UserButton } from '@clerk/nextjs';
import Logo from './assests/logo.jpg'
export default function Navbar() {
  return (
   
    <div className="w-full px-3 py-1 z-50">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-md rounded-xl px-4 py-2 flex justify-between items-center">
        <img src={Logo.src} alt="Logo"  width={120} className='rounded-[5px]'/>
        <UserButton />
      </div>
    </div>

  );
}
