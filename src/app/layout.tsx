import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SharePlay - Watch, Listen & Play Together",
  description: "Create virtual rooms to watch videos, listen to Spotify, and play games with friends in real-time sync.",
  keywords: ["SharePlay", "watch party", "Spotify", "gaming", "streaming", "social"],
  authors: [{ name: "SharePlay Team" }],
  openGraph: {
    title: "SharePlay - Watch, Listen & Play Together",
    description: "Create virtual rooms to watch videos, listen to Spotify, and play games with friends in real-time sync.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={beVietnamPro.variable}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
