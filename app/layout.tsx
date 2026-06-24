import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "1% — Find Your People",
  description: "At every event, 1% of the room will change your life. AI matchmaking + Lightning escrow for conferences.",
  manifest: "/manifest.json",
  openGraph: {
    title: "1% — Find Your People",
    description: "At every event, 1% of the room will change your life. AI matchmaking + Lightning escrow for conferences.",
    url: "https://1percent.one",
    siteName: "1%",
    images: [
      {
        url: "https://1percent.one/og-image.png",
        width: 1024,
        height: 1024,
        alt: "1% MatchSats",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1% — Find Your People",
    description: "AI matchmaking + Lightning escrow for conferences.",
    images: ["https://1percent.one/og-image.png"],
  },
  icons: {
    icon: "/og-image.png",
    apple: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#cafd00" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="1%" />
      </head>
      <body className="bg-[#0e0e0e] text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}