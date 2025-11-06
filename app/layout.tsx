import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI FAQ Assistant',
  description: 'Intelligent FAQ assistant with AI-powered chat',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
