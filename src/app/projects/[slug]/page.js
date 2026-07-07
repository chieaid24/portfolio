import { notFound } from "next/navigation";
import RewardLink from "@/components/RewardLink";
import { getProjectBySlug } from "@/app/data/projects";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import BackToProjects from "@/components/BackToProjects";
import RenderPageDisplay from "@/components/RenderPageDisplay";
import FooterGithub from "@/icons/FooterGithub";
import BulletIcon from "@/icons/BulletIcon"

// Generate metadata for each project page
export async function generateMetadata({ params }) {
  const { slug } = await params; // no need for await here since params is synchronous
  const project = getProjectBySlug(slug);

  if (!project || project.github_only) {
    return {
      title: "Project Not Found",
      alternates: {
        canonical: "https://aidanchien.com", // fallback
      },
    };
  }

  return {
    title: `${project.title.toUpperCase()}`,
    description: project.summaryMetaData,
    alternates: {
      canonical: `https://aidanchien.com/projects/${slug}`,
    },
  };
}

// Template function to render paragraphs
const renderParagraphs = (paragraphs, isSummary) => {
  if (!paragraphs || paragraphs.length === 0) {
    return null;
  }

  // Handle both single elements and arrays
  const paragraphArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

  return paragraphArray.map((paragraph, index) => (
    <div
      key={index}
      className="text-body-text text-base mb-6 leading-loose font-normal sm:text-lg sm:leading-relaxed"
    >
      {paragraph}
      {isSummary ? "." : ""}
    </div>
  ));
};

const renderTitle = (title) => {
  return <h2 className="mb-6 text-xl font-semibold sm:text-2xl">{title}</h2>;
};

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project || project.github_only) {
    notFound();
  }
  return (
    <>
      <div className="font-dm-sans text-body-text bg-background min-h-screen pt-35 md:pt-40">
        <MaxWidthWrapper>
          <div className="">
            <div className="mb-12">
              <div className="mb-6 flex flex-col gap-1">
                <h1 className="text-xl font-bold tracking-[0.2em] text-main-text sm:text-2xl md:text-3xl">
                  {project.title}
                </h1>
                <h3 className="text-light-grey-text text-lg sm:text-xl">
                  <span className="flex items-center gap-x-2">
                    <BulletIcon className="text-highlight-color h-2 w-2 shrink-0"/>
                    {project.subtitle}
                    <BulletIcon className="text-highlight-color h-2 w-2 shrink-0"/>
                    </span>
                </h3>
              </div>

              {/**Summary text */}
              <span className="flex font-normal">
                {renderParagraphs(project.summary, true)}
              </span>

              <RewardLink
                href={project.github_link}
                target="_blank"
                className=""
                rewardId={`${project.slug}:github`}
              >
                <div
                  className={`inline-flex items-center gap-2 rounded-md bg-main-text text-background px-2 py-1.5 font-semibold duration-100 md:hover:translate-x-[1px]`}
                >
                  <FooterGithub className={`h-6 w-6`} aria-hidden="true" />
                  <div>View GitHub</div>
                </div>
              </RewardLink>
            </div>

            {/* Background Section */}
            {project.background && (
              <section className="mb-12">
                {renderTitle("Background")}
                <div>{renderParagraphs(project.background)}</div>
              </section>
            )}

            {/* Tools Used Section */}
            {project.tool_paragraphs && (
              <section className="mb-12">
                {renderTitle("What tools?")}
                <div className="">
                  {renderParagraphs(project.tool_paragraphs)}
                </div>
              </section>
            )}

            {/* display 1 */}
            {project.page_displays[0] && (
              <RenderPageDisplay
                info={project.page_displays[0]}
                projectTitle={project.title}
              />
            )}

            {/** Why This Project */}
            {project.why_paragraphs && (
              <section className="mb-12">
                {renderTitle("Why this project?")}
                <div>
                  {renderParagraphs(project.why_paragraphs)}
                </div>
              </section>
            )}

            {/**optional second image - conditionally render 3D model or regular image */}

            {project.page_displays[1] && (
              <RenderPageDisplay
                info={project.page_displays[1]}
                projectTitle={project.title}
              />
            )}

            {/**What is it */}
            {project.what_paragraphs && (
              <section className="mb-12">
                {renderTitle("What is it?")}
                <div>
                  {renderParagraphs(project.what_paragraphs)}
                </div>
              </section>
            )}

            {/**what did I learn */}
            {project.learning_paragraphs && (
              <section>
                {renderTitle("What did I learn?")}
                <div>
                  {renderParagraphs(project.learning_paragraphs)}
                </div>
              </section>
            )}
            {/* Back to Projects Button */}
            <div className="mt-10 md:mt-12">
              <BackToProjects />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
