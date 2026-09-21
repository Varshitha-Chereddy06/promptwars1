import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clause2Life - GenAI Legal Document Consequence Simulator',
  description: 'Turn legalese into plain language and simulate your life under any contract with grounded GenAI reasoning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
