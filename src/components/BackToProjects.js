'use client';

import { useRouter } from 'next/navigation';

export default function BackToProjects() {
    const router = useRouter();

    const handleBackToProjects = () => {
        // Navigate to home page
        router.push('/#projects');
    };

    return (
        <div className="flex justify-end">
            <button
                onClick={handleBackToProjects}
                className="cursor-pointer group flex items-center gap-3 text-lg md:text-2xl font-semibold text-custom-red md:hover:text-custom-red/70 transition-colors duration-300"
            >
                Back to Projects
                <svg
                    className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>
    );
}