import RewardLink from "@/components/RewardLink";
import FooterGithub from "@/icons/FooterGithub";
import FooterLinkedin from "@/icons/FooterLinkedin";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-black pt-6 pb-8 sm:pt-15 sm:pb-15">
      <div className="mx-auto w-full px-5 sm:max-w-screen-xl lg:max-w-[65rem] lg:px-6 xl:max-w-[70rem] 2xl:w-[69%] 2xl:max-w-[70rem]">
        <div className="text-dark-grey-footer font-dm-sans flex max-w-full flex-col gap-6 font-normal sm:grid sm:grid-cols-2 sm:justify-between sm:gap-0">
          <div className="order-2 flex items-center justify-center text-sm leading-tight sm:order-1 sm:justify-start md:text-lg">
            <p>
              © {currentYear} AIDAN CHIEN. All rights reserved.
              <br />
              Designed and developed by AIDAN CHIEN.
            </p>
          </div>
          <div className="dark:text-dark-grey-footer order-1 flex items-center justify-center gap-3 text-[#4c4a48] sm:order-2 sm:justify-end sm:gap-12">
            <RewardLink
              href="https://www.linkedin.com/in/aidanchien/"
              target="_blank"
              rewardId="footer:linkedin"
              className="p-3 sm:p-0"
            >
              <FooterLinkedin className="h-[32px] w-[32px] shrink-0 transition-transform duration-200 hover:translate-y-[-2px] sm:h-[45px] sm:w-[45px]" />
            </RewardLink>
            <RewardLink
              href="https://github.com/chieaid24"
              target="_blank"
              rewardId="footer:github"
              className="p-3 sm:p-0"
            >
              <FooterGithub className="block h-[35px] w-[35px] shrink-0 overflow-visible align-middle leading-none transition-transform duration-200 hover:translate-y-[-2px] sm:h-12 sm:w-12" />
            </RewardLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
