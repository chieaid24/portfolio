import Link from "next/link";
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
              Navigated LLM application delivery on <span className="whitespace-nowrap"><RedText rewardId="exp:revvity:aws">AWS</RedText>,</span> provisioning <RedText rewardId="exp:revvity:terraform">Terraform</RedText> infrastructure and monitoring 
              performance with <RedText rewardId="exp:revvity:datadog">Datadog</RedText> and 
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
              Captained a squadron of <span className="whitespace-nowrap"><RedText rewardId="exp:needlist:7engineers">7 engineers</RedText>,</span> designing a <strong>Nest.js</strong> API layer,{" "}
              <strong>GitHub Actions</strong> <RedText rewardId="exp:needlist:cicd">CI/CD</RedText> pipeline, and TanStack React frontend.
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
              Pioneered tools and automations for aerospace machinists, harnessing <span className="whitespace-nowrap"><RedText rewardId="exp:autonomous:python">Python</RedText>,</span> <span className="whitespace-nowrap"><RedText rewardId="exp:autonomous:bash">Bash</RedText>,</span> and <span className="whitespace-nowrap"><RedText rewardId="exp:autonomous:gemini">Gemini API</RedText>.</span> 
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
      highlights: [
        {
          text: <>Minors in AI and Psychology</>,
        },
        {
          text: <>GPA: 3.95</>,
        },

      ],
    },
    {
      id: "aws",
      badge: {
        src: "/company-images/aws_logo.png",
        alt: "AWS logo",
      },
      title: "Certifications",
      period: "",
      highlights: [
        {
          text: (
            <Link
              href="https://www.credly.com/badges/3be83cd6-7c03-48d3-b7c1-fa4d232c6ee1/public_url"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              AWS Certified Solutions Architect
            </Link>
          ),
          note: <>Nov 2025</>,
        },
        {
          text: (
            <Link
              href="https://www.credly.com/badges/4f6a5c7f-537a-464d-8854-b4439e25d73d/public_url"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              AWS Certified Machine Learning Engineer
            </Link>
          ),
          note: <>Oct 2025</>,
        },
        {
          text: (
            <Link
              href="https://www.credly.com/badges/8d221e73-7452-4613-8894-6cd85aea8808/public_url"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              AWS Certified AI Practitioner
            </Link>
          ),
          note: <>Oct 2025</>,
        },
      ],
    },
  ],
};
