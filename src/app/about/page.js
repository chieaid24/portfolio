import AboutImage from "@/components/AboutImage";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RedText from '@/components/RewardRedText';
import SpotifyEmbed from '@/components/SpotifyEmbed'
import ChessWidget from "@/components/ChessWidget";
import ClashWidget from "@/components/ClashWidget";
import WidgetCarousel from "@/components/WidgetCarousel";
import Link from "next/link";

export const metadata = {
  title: 'AIDAN CHIEN || About',
  description: 'Who is Aidan Chien?',
  alternates: {
    canonical: "https://aidanchien.com/about",
  },
};

const widgets = [
  {
    id: "spotify",
    title: "Spotify Playlist",
    element: <SpotifyEmbed playlistId="1oQngKRVkU7oI8hmB4hf7i" theme={0} />,
  },
  {
    id: "chess",
    title: "Chess.com",
    element: <ChessWidget />,
  },
  {
    id: "clash",
    title: "Clash Royale",
    element: <ClashWidget />,
  },
];

export default function AboutPage() {
  return (
    <main className="font-medium font-dm-sans ">
      <div className="pt-20 5xl:pt-25 bg-background-light text-dark-grey-text ">
        <MaxWidthWrapper>
          <div className="flex justify-start mt-10 sm:mt-8 lg:mt-12 lg:ml-[12px]">  {/* Outer div that is a flex box so text acts as a single line of text when window shrinks + is centered as well */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl sm:text-center text-dark-grey-text"> {/* Makes it so when text is shrunk, its paragraph alignment is center */}
              <span className="font-bold font-dm-sans">Who is <span className="inline md:hidden">this </span></span>
              <br className="block sm:hidden" />
              <span className="font-dm-sans font-bold">Aidan Chien</span>
              <span className="font-bold font-dm-sans">?</span>
            </h1>
          </div>

          {/* image and blurb section */}
          <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-8 items-start mt-10 break-normal 5xl:mr-15">
            <AboutImage className="" />
            <div className="flex justify-self-start text-left flex-col leading-tight text-[17px] md:text-[21px] lg:text-[28px] text-dark-grey-text h-full gap-y-6 font-medium">
              <p className="">
                I&apos;m a <RedText rewardId="red:about:syde">Systems Design Engineering</RedText>
                {" "}student at the University of Waterloo!
              </p>
              <p>
                I take pride in my ability to design and develop high quality solutions for <span className="whitespace-nowrap">
                  <RedText rewardId="red:about:software">software</RedText>,
                </span> <RedText rewardId="red:about:mechanical">mechanical</RedText>, and <RedText rewardId="red:about:electrical">electrical</RedText> systems.
              </p>
              <p>
                I&apos;m passionate about taking my skills to the next level and <RedText rewardId="red:about:impact">making an impact</RedText> on the greater community.
              </p>
            </div>
          </section>

          {/* Interest Section */}
          <section className="grid grid-cols-1 place-items-center 5xl:place-items-start pt-8 pb-10  
                          md:pb-20 
                          lg:flex
                          5xl:grid 5xl:grid-cols-2">
            <div className="ml-3 mr-8 order-2 mt-6
                            md:flex-1 
                            lg:order-1 lg:mt-0">
              <h2 className="font-semibold text-2xl sm:text-[38px] leading-tight">You can also find me:</h2>
              <li className="list-none  lg:marker:text-xl text-[19px] md:text-[21px] lg:text-[28px] font-medium pt-4"> Playing team sports
                <ul className="flex gap-2 pl-8 text-light-grey-text text-[17px] md:text-xl font-normal">
                  <li>-</li>
                  <li>Basketball and volleyball are my main ones right now!</li>
                </ul>
              </li>
              <li className="list-none lg:marker:text-xl text-[19px] md:text-[21px] lg:text-[28px] font-medium"> Rock climbing
                <ul className="flex gap-2 pl-8 text-light-grey-text text-[17px] md:text-xl font-normal">
                  <li>-</li>
                  <li>Mostly bouldering but I&apos;ve done a few outdoor top rope climbs!</li>
                </ul>
              </li>
              <li className="list-none  lg:marker:text-xl text-[19px] md:text-[21px] lg:text-[28px] font-medium">
                <Link
                  href="https://www.youtube.com/@picturingaidanchien"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-90"
                >Filmmaking</Link>
                <ul className="flex gap-2 pl-8 text-light-grey-text text-[17px] md:text-xl font-normal">
                  <li>-</li>
                  <li>My preferred mode of creative expression, and I&apos;m always looking for inspiration for my next project!</li>
                </ul>
              </li>
            </div>
            <WidgetCarousel items={widgets} className="order-1 lg:order-2 lg:flex-none w-full max-w-[540px]" />
          </section>
        </MaxWidthWrapper>
      </div>
    </main>
  );
}
