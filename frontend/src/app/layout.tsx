import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ClientOnly from "@/components/ClientOnly";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "VoiceVitals - Voice-Controlled Health Tracker",
  description: "Track your health symptoms and medications through natural voice conversations. AI-powered health insights for better accessibility.",
  keywords: ["voice health tracker", "AI health", "accessibility", "symptom tracking", "medication tracking", "voice recognition"],
  authors: [{ name: "VoiceVitals Team" }],
  openGraph: {
    title: "VoiceVitals - Voice-Controlled Health Tracker",
    description: "Track your health symptoms and medications through natural voice conversations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceVitals - Voice-Controlled Health Tracker",
    description: "Track your health symptoms and medications through natural voice conversations.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <ClientOnly>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
