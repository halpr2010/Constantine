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

export const metadata: Metadata = {
  // Makes the relative /og-image.png resolve to an absolute URL for scrapers.
  metadataBase: new URL("https://www.constantineanalytics.com"),
  title: "Constantine: privacy-preserving engagement analytics for physical spaces",
  description:
    "Measure how people actually use physical space. Privacy-preserving, edge-processed behavioural analytics for museums, galleries and gyms: attention, engagement, movement and flow, calibrated to real-world dimensions.",
  openGraph: {
    title:
      "Constantine: privacy-preserving engagement analytics for physical spaces",
    description:
      "Measure how people actually use physical space. Privacy-preserving, edge-processed behavioural analytics for museums, galleries and gyms.",
    url: "https://www.constantineanalytics.com",
    siteName: "Constantine",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Constantine" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Constantine: privacy-preserving engagement analytics for physical spaces",
    description:
      "Measure how people actually use physical space. Privacy-preserving, edge-processed behavioural analytics for museums, galleries and gyms.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
