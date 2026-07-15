"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PageShell({ children }) {
  const pathname = usePathname();
  // block form so a patched window.scrollTo (e.g. smooth-scroll browser
  // extensions returning a Promise) is never treated as a cleanup function
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <main key={pathname} className="fade-in-page">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
