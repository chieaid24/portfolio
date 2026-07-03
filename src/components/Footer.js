import RewardLink from "@/components/RewardLink";
import FooterGithub from "@/icons/FooterGithub";
import FooterLinkedin from "@/icons/FooterLinkedin";
import FooterEmail from "@/icons/FooterEmail";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full pt-16 pb-8">
      <div className="text-outline-gray font-dm-sans flex flex-col items-center gap-y-2">
        <div className="flex gap-x-3">
          <RewardLink
            href="https://www.linkedin.com/in/aidanchien/"
            target="_blank"
            rewardId="footer:linkedin"
            aria-label="LinkedIn"
            className="md:hover:translate-y-[-1px]"
          >
            <FooterLinkedin className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text/75" />
          </RewardLink>
          <RewardLink
            href="https://github.com/chieaid24"
            target="_blank"
            rewardId="footer:github"
            aria-label="GitHub"
            className="md:hover:translate-y-[-1px]"
          >
            <FooterGithub className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text/75" />
          </RewardLink>
          <RewardLink
            href="mailto:aidan.chien@uwaterloo.ca"
            target="_blank"
            rewardId="email"
            aria-label="Email"
            className="md:hover:translate-y-[-1px]"
          >
            <FooterEmail className="h-8 w-8 transition-colors duration-100 md:hover:text-main-text/75" />
          </RewardLink>
        </div>
        <div className="text-center text-sm leading-tight">
          <p>
            © {currentYear} AIDAN CHIEN.
            <br />
            Designed and developed by AIDAN CHIEN.
          </p>
        </div>
      </div>
    </footer>
  );
}
