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
  title: "AskMyDoc - PDF RAG Application",
  description: "Upload and query your PDF documents using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}>

         <SignedOut>
        <div className="w-screen h-screen flex justify-center items-center"
        style={{backgroundImage: `url(${bgImage.src})`,
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
