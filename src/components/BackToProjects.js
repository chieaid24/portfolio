"use client";

import { useRouter } from "next/navigation";
import SimpleArrow from "@/icons/SimpleArrow";

export default function BackToProjects() {
  const router = useRouter();

  const handleBackToProjects = () => {
    // Navigate to home page
    router.push("/projects");
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleBackToProjects}
        className="group text-outline-gray group flex cursor-pointer items-center gap-3 text-lg font-semibold transition-transform duration-100 hover:translate-x-[1px]"
      >
        All Projects
        <SimpleArrow className="h-3 w-3 translate-y-[1px] transition-transform group-hover:translate-x-[1px]" />
      </button>
    </div>
  );
}
