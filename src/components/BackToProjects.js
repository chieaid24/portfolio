"use client";

import { useRouter } from "next/navigation";
import SimpleArrow from "@/icons/SimpleArrow";

export default function BackToProjects() {
  const router = useRouter();

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleBackToProjects}
        className="group text-outline-gray group text-md flex cursor-pointer items-center gap-3 font-medium transition-transform duration-100 hover:translate-x-[1px] md:text-lg"
      >
        All Projects
        <SimpleArrow className="h-2.5 w-2.5 translate-y-[1px] transition-transform group-hover:translate-x-[2px]" />
      </button>
    </div>
  );
}
