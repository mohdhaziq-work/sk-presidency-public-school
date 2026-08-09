import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SK Presidency Public School — Sultanpur | CBSE 2133231',
  description: 'CBSE Affiliated (2133231), Play Group to Class XII, Sultanpur, UP. Founded 2013.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 text-gray-800 antialiased min-h-screen" style={{fontFamily:"'Inter',system-ui,sans-serif"}}>
        {children}
      </body>
    </html>
  );
}
