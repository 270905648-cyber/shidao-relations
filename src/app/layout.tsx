import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "师道·人际关系智库",
  description: "专为高中数学老师设计的人际关系管理工具，帮助您在有限精力下实现高效社交。",
  keywords: ["人际关系", "社交管理", "能量预算", "教师工具"],
  authors: [{ name: "师道智库" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="min-h-screen flex flex-col pb-16">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
