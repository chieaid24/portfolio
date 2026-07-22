// Lives in its own module (not projects.js) so that money-context — which wraps
// every page — doesn't drag the full JSX project content into every route's
// client bundle just to read these three numbers.
export const quest_totals = {
  // About: 3 | Experiences: 10 | AI Sleep: 10 | Website: 11 | PMI: 9 | 3D Tools: 5
  // CURR TOTAL: 48
  redtext: 48,

  // OnePerProject: 4
  // CURR TOTAL: 4
  project: 4,

  // Header: 3[about, projects, resume] | Footer: 2[linkedin, github] | OnePerProject: 4 | Home/Experience: 1[education-tab] | Website: 0
  // Website: each project with a non-empty website_link adds 1 (currently 0 filled in)
  // CURR TOTAL: 10
  link: 10,
};
