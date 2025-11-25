import Link from 'next/link';
import Header from '@/components/Header';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';

export default function NotFound() {
    return (
        <div className="bg-background-light font-dm-sans text-main-text min-h-screen">
            <MaxWidthWrapper>
                <div className="pt-40 pb-20 text-center">
                    <h1 className="text-6xl font-bold mb-2">404</h1>
                    <h2 className="text-2xl mb-8 font-bold">Project Not Found</h2>
                    <p className="text-lg mb-8">
                        Sorry! The project you&apos;re looking for doesn&apos;t exist or may have been moved.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block bg-custom-red text-white px-6 py-3 rounded-lg hover:bg-custom-red/80 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </MaxWidthWrapper>
        </div>
    );
}
