import { projects } from "@/app/data/projects";

const SITE_URL = "https://aidanchien.com";

export default function sitemap() {
  const lastModified = new Date();

  const staticPages = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];

  const projectPages = projects
    .filter((project) => project.slug && !project.github_only)
    .map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticPages, ...projectPages];
}
