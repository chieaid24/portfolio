import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-[80vh] items-center">
      <MaxWidthWrapper className="text-center">
        <p className="text-main-text mb-3 text-7xl font-bold sm:text-8xl">404</p>
        <h1 className="text-main-text mb-4 text-xl font-bold tracking-[0.2em] sm:text-2xl">
          Page Not Found
        </h1>
        <p className="text-body-text mx-auto mb-10 max-w-md text-base sm:text-lg">
          This page wandered off somewhere. Let&apos;s get you back home.
        </p>
        <Link
          href="/"
          className="bg-highlight-color inline-block rounded-lg px-6 py-3 font-semibold text-white transition-transform duration-100 hover:-translate-y-[2px]"
        >
          Back Home
        </Link>
      </MaxWidthWrapper>
    </div>
  );
}
