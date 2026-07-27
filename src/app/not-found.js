import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export const metadata = {
  title: "PAGE NOT FOUND",
};

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center">
      <MaxWidthWrapper className="text-center">
        <h1 className="text-main-text mb-4 text-xl font-bold tracking-[0.2em] sm:text-2xl md:mb-8 md:text-3xl">
          Page Not Found
        </h1>
        <p className="text-body-text mx-auto mb-6 max-w-md text-base">
          This isn&apos;t the page you&apos;re looking for. <br /> You can go about your
          business.
        </p>
        <Link
          href="/"
          className="bg-highlight-color inline-block rounded-lg px-4 py-2 font-semibold text-white transition-transform duration-100"
        >
          Move Along
        </Link>
      </MaxWidthWrapper>
    </div>
  );
}
