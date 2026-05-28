import RedText from "@/components/RewardRedText";

// <RedText rewardId="exp:">red text</RedText>
export const experiences = {
  work: [
    {
      id: "revvity",
      badge: {
        src: "/company-images/revvity-logo_v2.png",
        alt: "Revvity logo",
      },
      title: "AI DevOps Engineer",
      subtitle: "Revvity",
      period: "May 2026 - Present",
      highlights: [
        {
          text: (
            <>
              Navigated LLM application delivery on AWS, provisioning infrastructure with Terraform, and monitoring 
              AI systems with Datadog and 
              CloudWatch.
            </>
          ),
        },
      ],
    },
    {
      id: "needlistorg",
      badge: {
        src: "/company-images/needlist-logo.png",
        alt: "NeedList.ORG logo",
      },
      title: "Software Engineer",
      subtitle: "NeedList.ORG",
      period: "Sep 2025 - Jan 2026",
      highlights: [
        {
          text: (
            <>
              Captained a squadron of 7 engineers, designing a <strong>Nest.js</strong> API layer,{" "}
              <strong>GitHub Actions</strong> CI/CD pipeline, and TanStack React frontend.
            </>
          ),
        },
      ],
    },
    {
      id: "autonomousmachining",
      badge: {
        src: "/company-images/autonomous-logo_v2.png",
        alt: "Autonomous Machining logo",
      },
      title: "R&D Software Engineer",
      subtitle: "Autonomous Machining",
      period: "Dec 2024 - Apr 2025",
      highlights: [
        {
          text: (
            <>
              Pioneered tools and automations for aerospace machining workflows, harnessing Python, Bash, and Gemini API. 
            </>
          ),
        },
      ],
    },
  ],
  education: [
    {
      id: "uwaterloo",
      badge: {
        src: "/company-images/waterloo-logo_v2.png",
        alt: "University of Waterloo logo",
      },
      title: "University of Waterloo",
      subtitle:
        "Bachelor of Applied Science (BASc), Systems Design Engineering",
      // period: "Sep 2024 - Present",
      highlights: [
        {
          text: <>Cumulative GPA: 92.13%</>,
        },
        {
          text: <>2x Term Distinction</>,
        },

        {
          text: (
            <>
              Awards: Systems Design Co-op for Good Award - $12,000,
              President&apos;s Scholar of Distinction - $2,000, President&apos;s
              Research Award - $1,500
            </>
          ),
        },
      ],
    },
    {
      id: "aws",
      badge: {
        src: "/company-images/aws_logo.png",
        alt: "AWS logo",
      },
      title: "Cloud Certifications - Amazon Web Services (AWS)",
      period: "",
      highlights: [
        {
          text: <>AWS Certified Solutions Architect - Associate</>,
          note: <>Nov 2025</>,
        },
        {
          text: <>AWS Certified Machine Learning Engineer - Associate</>,
          note: <>Oct 2025</>,
        },
        { text: <>AWS Certified AI Practitioner</>, note: <>Oct 2025</> },
      ],
    },
  ],
};
