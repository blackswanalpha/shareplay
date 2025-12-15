"use client";

import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion"; // Added framer-motion imports
import { usePathname } from 'next/navigation'; // Added usePathname import
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Added usePathname

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={beVietnamPro.variable}>

          <AnimatePresence mode='wait'>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }} // Ensure motion.div takes full size
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </body>
      </html>
    </ClerkProvider>
  );
}
