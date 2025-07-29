import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import bgImage from './assests/bg.jpg'
import "./globals.css";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignUp,
} from '@clerk/nextjs'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AskMyDoc",
  description: "Developed by rehmnjr ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
         <SignedOut>
        <div className="w-screen h-screen flex justify-center items-center"
        style={{backgroundImage: `url(${bgImage.src || bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',}}>

          <SignUp/>
        </div>
         </SignedOut>

        <SignedIn>
        {children}
        </SignedIn>
    
      </body>
    </html>
    </ClerkProvider>
  );
}
