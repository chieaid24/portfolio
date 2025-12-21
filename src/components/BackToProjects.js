"use client";

import SimpleArrow from "@/icons/SimpleArrow";
import Link from "next/link";

export default function BackToProjects() {
  return (
    <div className="flex justify-end">
      <Link
        href="/projects"
        scroll
        className="group text-outline-gray group text-md flex cursor-pointer items-center gap-3 font-semibold transition-transform duration-100 hover:translate-x-[1px] md:text-lg"
      >
        All Projects
        <SimpleArrow className="h-3 w-3 translate-y-[1px] transition-transform group-hover:translate-x-[2px]" />
      </Link>
    </div>
  );
}
