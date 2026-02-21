import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "University Notes | Khadija Jumani",
  description: "A centralized hub for university subject notes and resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-start pt-24 px-4 sm:px-10">
          {children}
        </main>
      </body>
    </html>
  );
}
