// @ts-ignore
// import '@/app/ui/global.css'; this cannot use in here, so code is a little change as in following.
import { Metadata } from 'next';
import './ui/global.css';
import { inter } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: 'Acme Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
