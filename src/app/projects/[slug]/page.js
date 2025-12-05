import { notFound } from "next/navigation";
import RewardLink from "@/components/RewardLink";
import { getProjectBySlug } from "@/app/data/projects";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import BackToProjects from "@/components/BackToProjects";
import RenderPageDisplay from "@/components/RenderPageDisplay";
import FooterGithub from "@/icons/FooterGithub";

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
    title: `${project.title} | Aidan Chien`,
    description: project.summaryMetaData,
    alternates: {
      canonical: `https://aidanchien.com/projects/${slug}`,
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
    <div
      key={index}
      className="text-body-text mb-6 text-lg leading-relaxed font-normal"
    >
      {paragraph}
    </div>
  ));
};

const renderTitle = (title) => {
  return <h2 className="mb-6 text-2xl font-semibold">{title}</h2>;
};

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }
  return (
    <>
      <div className="font-dm-sans text-body-text mt-40 min-h-screen">
        <MaxWidthWrapper>
          <div className="">
            <div className="mb-20">
              <div className="mb-6 flex flex-col gap-1">
                <h1 className="text-4xl font-bold tracking-[0.2em] text-white">
                  {project.title}
                </h1>
                <h3 className="text-light-grey-text text-2xl italic">
                  &apos;{project.subtitle}&apos;
                </h3>
              </div>

              {/**Summary text */}
              <div className="font-normal">
                {renderParagraphs(project.summary)}
              </div>

              <RewardLink
                href={project.github_link}
                target="_blank"
                className=""
                rewardId={`${project.slug}:github`}
              >
                <div
                  className={`inline-flex items-center gap-2 rounded-md bg-white px-1.5 py-1.5 font-semibold text-black`}
                >
                  <FooterGithub className={`h-6 w-6`} aria-hidden="true" />
                  <div>View GitHub</div>
                </div>
              </RewardLink>
            </div>

            {/* Background Section */}
            <section className="text-md font-base mb-20">
              {renderTitle("Background")}
              <div>{renderParagraphs(project.background)}</div>
            </section>

            {/* Tools Used Section */}
            <section className="mb-20">
              {renderTitle("What tools?")}
              <div className="">
                {renderParagraphs(project.tool_paragraphs)}
              </div>
            </section>

            {/* display 1 */}
            {project.page_displays[0] && (
              <RenderPageDisplay
                info={project.page_displays[0]}
                projectTitle={project.title}
              />
            )}

            {/** Why This Project */}
            <section className="mb-15">
              {renderTitle("Why this project?")}
              <div className="font-regular text-2xl">
                {renderParagraphs(project.why_paragraphs)}
              </div>
            </section>

            {/**optional second image - conditionally render 3D model or regular image */}

            {project.page_displays[1] && (
              <RenderPageDisplay
                info={project.page_displays[1]}
                projectTitle={project.title}
              />
            )}

            {/**What is it */}
            <section className="mb-20">
              {renderTitle("What is it?")}
              <div className="font-regular text-2xl">
                {renderParagraphs(project.what_paragraphs)}
              </div>
            </section>

            {/**what did I learn */}
            <section>
              {renderTitle("What did I learn?")}
              <div className="font-regular text-2xl">
                {renderParagraphs(project.learning_paragraphs)}
              </div>
            </section>
            {/* Back to Projects Button */}
            <div className="mt-10 md:mt-20">
              <BackToProjects />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
