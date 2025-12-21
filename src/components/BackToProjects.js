"use client";

import { useRouter } from "next/navigation";
import SimpleArrow from "@/icons/SimpleArrow";

export default function BackToProjects() {
  const router = useRouter();

  const handleBackToProjects = () => {
    router.push("/projects");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleBackToProjects}
        className="group text-outline-gray group text-md flex cursor-pointer items-center gap-3 font-semibold transition-transform duration-100 hover:translate-x-[1px] md:text-lg"
      >
        All Projects
        <SimpleArrow className="h-3 w-3 translate-y-[1px] transition-transform group-hover:translate-x-[2px]" />
      </button>
    </div>
  );
}
