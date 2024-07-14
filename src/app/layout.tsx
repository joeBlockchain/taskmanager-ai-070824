import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TaskManager AI",
  description:
    "AI-enhanced task management application for improved productivity and organization",
  keywords: [
    "AI",
    "task management",
    "productivity",
    "organization",
    "to-do list",
    "project management",
    "time management",
    "task prioritization",
    "collaboration",
  ],
  authors: [{ name: "TaskManager AI Team" }],
  creator: "TaskManager AI",
  publisher: "TaskManager AI Inc.",
  openGraph: {
    title: "TaskManager AI: Revolutionize Your Productivity",
    description:
      "Manage tasks efficiently with AI-powered insights and automation",
    url: "https://TaskManager-ai.com",
    siteName: "TaskManager AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskManager AI: AI-Powered Task Management",
    description:
      "Elevate your productivity with intelligent task organization and prioritization",
    creator: "@TaskManagerai",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="mx-4 md:mx-8 h-screen">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
