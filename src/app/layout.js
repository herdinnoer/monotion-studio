import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'Monotion Studio',
  description: 'Instant animation generator',
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans bg-[#1C1C1E] text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}