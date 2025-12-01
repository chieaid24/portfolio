"use client";

import { usePathname } from "next/navigation";
import { DM_Sans, Italiana, Noto_Sans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import ScrollProgressBarClient from "@/components/ScrollProgressBarClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./providers.js";
import { SpeedInsights } from "@vercel/speed-insights/next";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
});
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} bg-background-light text-[16px]`}
      suppressHydrationWarning
    >
      <head>
        {/* Charset & Viewport */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Explore the portfolio of Aidan Chien, a systems engineer bridging design, development, and innovation to build cool stuff."
        />
        <meta
          name="keywords"
          content="Aidan Chien, systems engineer, portfolio, web development, design, coding"
        />
        <meta name="author" content="Aidan Chien" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://aidanchien.com" />
        <meta
          property="og:image"
          content="https://aidanchien.com/open_graph/opengraph_image_v1.png"
        />
        <meta property="og:site_name" content="Aidan Chien Portfolio" />
        <meta property="og:title" content="Aidan's Portfolio" />
        <meta
          property="og:description"
          content="Explore the portfolio of Aidan Chien, a systems engineer bridging design, development, and innovation to build cool stuff."
        />
        <meta name="application-name" content="AIDAN CHIEN" />
        <meta itemProp="name" content="AIDAN CHIEN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://aidanchien.com/open_graph/opengraph_image_v1.png"
        />
        <meta
          name="twitter:title"
          content="AIDAN CHIEN || Developer & Designer"
        />
        <meta
          name="twitter:description"
          content="Explore the portfolio of Aidan Chien, a systems engineer bridging design, development, and innovation to build cool stuff."
        />
        {/* Canonical */}
        <link rel="canonical" href="https://aidanchien.com" />
        {/** JSON-LD */}
        <Script
          id="structured-data-person"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Aidan Chien",
              url: "https://aidanchien.com",
              image: "https://aidanchien.com/about/about_image_1.png",
              sameAs: [
                "https://www.linkedin.com/in/aidanchien",
                "https://github.com/chieaid24",
              ],
              jobTitle: "Systems Engineer Student",
            }),
          }}
        />

        <Script
          id="structured-data-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://aidanchien.com",
              name: "Aidan Chien Portfolio",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://aidanchien.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${dmSans.className} ${italiana.variable} ${notoSans.variable} min-h-screen overscroll-none antialiased`}
      >
        <Providers>
          <main key={pathname} className="fade-in-page">
            <ScrollProgressBarClient />
            <Header />
            {children}
            <Footer />
          </main>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
