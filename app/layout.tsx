import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../contexts/UserContext";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Aalaq - Ramadan Storyteller",
  description: "AI-powered storytelling and gamification inspired by wisdom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased bg-brand-dark text-brand-cream`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
