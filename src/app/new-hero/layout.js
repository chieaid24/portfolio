// Temporary hero-redesign preview: keep it out of search and out of the sitemap.
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewHeroLayout({ children }) {
  return children;
}
