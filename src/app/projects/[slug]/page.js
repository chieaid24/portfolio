
import { notFound } from 'next/navigation';
import RewardLink from '@/components/RewardLink';
import { getProjectBySlug, projects } from '@/app/data/projects';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import BackToProjects from '@/components/BackToProjects';
import ProjectGithub from "@/icons/ProjectGithub"
import RenderPageDisplay from "@/components/RenderPageDisplay"
import FooterGithub from "@/icons/FooterGithub"

// Generate metadata for each project page
export async function generateMetadata({ params }) {
    const { slug } = await params; // no need for await here since params is synchronous
    const project = getProjectBySlug(slug);

    if (!project) {
        return {
            title: "Project Not Found",
            alternates: {
                canonical: "https://aidanchien.com", // fallback
            },
        };
    }

    return {
        title: `AIDAN CHIEN || ${project.title}`,
        description: project.summaryMetaData,
        alternates: {
            canonical: `https://aidanchien.com/${slug}`,
        },
    };
}

// Template function to render paragraphs
const renderParagraphs = (paragraphs) => {
    if (!paragraphs || paragraphs.length === 0) {
        return null;
    }

    // Handle both single elements and arrays
    const paragraphArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

    return paragraphArray.map((paragraph, index) => (
        <div key={index} className="text-xl md:text-2xl mb-6 leading-loose md:leading-normal">
            {paragraph}
        </div>
    ));
};


export default async function ProjectPage({ params }) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        notFound();
    }
    return (
        <>
            <div className="pt-20 bg-background-light font-dm-sans text-dark-grey-text min-h-screen">
                <MaxWidthWrapper>
                    <div className="pt-12 pb-10 md:pb-15 
                                    md:pt-18 ">
                        <div className="mb-18 md:mb-20">
                            <div className="flex relative items-center">
                                <h1 className="font-black text-6xl 
                                                md:text-7xl">
                                    {project.title}
                                </h1>
                                <RewardLink
                                    href={project.github_link}
                                    target="_blank"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-auto"
                                    rewardId={`${project.slug}:github`}>
                                    <ProjectGithub className="w-[100px] h-[100px] hover:opacity-80 hover:-translate-y-1 transition duration-200 hidden lg:block" />
                                </RewardLink>
                            </div>
                            <h3 className="italic text-light-grey-text opacity-80 mt-1 text-2xl
                                            md:text-3xl">
                                &apos;{project.subtitle}&apos;
                            </h3>
                            <RewardLink
                                href={project.github_link}
                                target="_blank"
                                className=""
                                rewardId={`${project.slug}:github`}>
                                <div className={`inline-flex items-center gap-2 text-white rounded-md font-semibold bg-custom-red py-1.5 px-1.5 mt-4 lg:hidden ml-[1px]`}>
                                    <FooterGithub className={`h-[24px] w-[24px]`} aria-hidden="true" />
                                    <div>View GitHub</div>
                                </div>
                            </RewardLink>
                        </div>
                        {/**Summary text */}
                        <div className='text-2xl font-regular'>
                            {renderParagraphs(project.summary)}
                        </div>

                        {project.page_displays[0] && (
                            <RenderPageDisplay info={project.page_displays[0]} projectTitle={project.title} />
                        )}

                        {/* Tools Used Section */}
                        <section className="mb-20">
                            <h1 className="font-bold mb-10 text-4xl
                                            md:text-5xl">
                                What tools?
                            </h1>
                            <div className='text-2xl font-regular'>
                                {renderParagraphs(project.tool_paragraphs)}
                            </div>
                        </section>

                        {/** Why This Project */}
                        <section className="mb-15">
                            <h1 className="font-bold text-4xl md:text-5xl mb-10">
                                Why this project?
                            </h1>
                            <div className='text-2xl font-regular'>
                                {renderParagraphs(project.why_paragraphs)}
                            </div>
                        </section>

                        {/**optional second image - conditionally render 3D model or regular image */}

                        {project.page_displays[1] && (
                            <RenderPageDisplay info={project.page_displays[1]} projectTitle={project.title} />
                        )}

                        {/**What is it */}
                        <section className="mb-20">
                            <h1 className="font-bold text-4xl md:text-5xl mb-10">
                                What is it?
                            </h1>
                            <div className='text-2xl font-regular'>
                                {renderParagraphs(project.what_paragraphs)}
                            </div>
                        </section>

                        {/**what did I learn */}
                        <section>
                            <h1 className="font-bold text-4xl md:text-5xl mb-10">
                                What did I learn?
                            </h1>
                            <div className='text-2xl font-regular'>
                                {renderParagraphs(project.learning_paragraphs)}
                            </div>
                        </section>
                        {/* Back to Projects Button */}
                        <div className="mt-10 md:mt-20">
                            <BackToProjects />
                        </div>
                    </div>
                </MaxWidthWrapper >
            </div >
        </>
    );
}