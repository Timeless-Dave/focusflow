import { Inter } from 'next/font/google';
import '@/styles/global.css';
import '@/styles/overrides.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

export const metadata = {
  title: 'FocusFlow — AI-Powered ADHD Classroom Support',
  description:
    'FocusFlow helps elementary and middle school teachers support students with ADHD through AI-tailored lessons, live recovery mode, and practical parent communication.',
  icons: {
    icon: [
      { url: '/brand/favicon.png', type: 'image/png', sizes: '512x512', media: '(prefers-color-scheme: light)' },
      { url: '/brand/favicon-dark.png', type: 'image/png', sizes: '512x512', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: [{ url: '/brand/favicon.png', type: 'image/png' }],
    apple: [
      { url: '/brand/apple-icon.png', sizes: '180x180', media: '(prefers-color-scheme: light)' },
      { url: '/brand/apple-icon-dark.png', sizes: '180x180', media: '(prefers-color-scheme: dark)' }
    ]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
