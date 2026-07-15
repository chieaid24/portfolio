import { DM_Sans, Italiana, Noto_Sans } from "next/font/google";
import "./globals.css";
import PageShell from "@/components/PageShell";
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

const SITE_URL = "https://aidanchien.com";
const SITE_DESCRIPTION =
  "Aidan Chien is a software engineer who bridges system design and cloud computing to create practical solutions.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AIDAN CHIEN",
  description: SITE_DESCRIPTION,
  applicationName: "Aidan Chien",
  authors: [{ name: "Aidan Chien", url: SITE_URL }],
  creator: "Aidan Chien",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Aidan Chien Portfolio",
    title: "Aidan's Portfolio",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/open_graph/opengraph_image_v1.png",
        width: 5000,
        height: 2625,
        alt: "Aidan Chien portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aidan's Portfolio",
    description: SITE_DESCRIPTION,
    images: ["/open_graph/opengraph_image_v1.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aidan Chien",
  url: SITE_URL,
  image: `${SITE_URL}/about/stack_images/about_image_1.png`,
  sameAs: [
    "https://www.linkedin.com/in/aidanchien",
    "https://github.com/chieaid24",
  ],
  jobTitle: "Systems Engineer Student",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE_URL,
  name: "Aidan Chien Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} bg-background-light text-[16px]`}
      suppressHydrationWarning
    >
      <body
        className={`${dmSans.className} ${italiana.variable} ${notoSans.variable} min-h-screen overscroll-none antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>
          <PageShell>{children}</PageShell>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
