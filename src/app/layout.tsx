import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
// AuthProvider removed - using Clerk
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendTracker - Your Personal CFO",
  description: "Intelligent UPI-style spend tracker that reads bank statements and SMS to give you spending insights",
  keywords: ["UPI", "spend tracker", "expense manager", "budget", "personal finance", "India"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
