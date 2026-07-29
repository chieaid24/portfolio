// Lives in its own module (not projects.js) so that money-context — which wraps
// every page — doesn't drag the full JSX project content into every route's
// client bundle just to read these three numbers.
export const quest_totals = {
  // About: 3 | Experiences: 10 | AI Sleep: 10 | Website: 11 | PMI: 9 | 3D Tools: 5
  // CURR TOTAL: 48
  redtext: 48,

  // OnePerProject: 5
  // CURR TOTAL: 5
  project: 5,

  // Header: 3 | Footer/Hero: 2 | Experience: 1 | Project GitHub: 4
  // projects-page is shared by Header, Home, and project detail navigation
  // Website: each project with a non-empty website_link adds 1 (currently 0 filled in)
  // CURR TOTAL: 10
  link: 10,
};
