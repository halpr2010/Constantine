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
        {/* The entry question is asked on EVERY load (founder decision, 09 Sep
            2026), so there is no stored choice to honour here any more — only a
            deep link may skip the gate, because a link to #privacy or a crawler
            must never land behind an unanswered question (§4). This still has
            to be settled BEFORE first paint, or the entry view flashes up and
            jumps away. Any value written by an earlier build is cleared, so a
            visitor who chose before this change is not kept out of the gate for
            good. Silent on failure: a blocked origin just gets asked.

            `data-ground` is stamped in the same breath and for the same reason.
            The page's ground is a root attribute now (§5, THE PAGE GROUND in
            globals.css) and GroundDriver only resolves it after hydration, so
            without this the first paint is the theme's own root ground and the
            page crosses into its real one a frame later. The gate opens on
            technical; a deep link lands on the hero, which is product. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;" +
              "try{localStorage.removeItem('constantine:vertical');}catch(e){}" +
              "if(location.hash){d.setAttribute('data-entry','answered');" +
              "d.setAttribute('data-ground','product');}" +
              "else{d.setAttribute('data-entry','asking');" +
              "d.setAttribute('data-ground','technical');}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
