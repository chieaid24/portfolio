import Link from "next/link";
import Header from "@/components/Header";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function NotFound() {
  return (
    <div className="bg-background font-dm-sans text-body-text min-h-screen">
      <MaxWidthWrapper>
        <div className="pt-40 pb-20 text-center">
          <h1 className="mb-2 text-6xl font-bold">404</h1>
          <h2 className="mb-8 text-2xl font-bold">Project Not Found</h2>
          <p className="mb-8 text-lg">
            This isn&apos;t the project you&apos;re looking for. You can go
            about your business :)
          </p>
          <Link
            href="/"
            className="bg-highlight-color inline-block rounded-lg px-6 py-3 font-semibold text-white transition-transform duration-100 hover:-translate-y-[2px]"
          >
            Move Along
          </Link>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
