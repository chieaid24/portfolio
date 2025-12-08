import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RedText from "@/components/RewardRedText";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import ChessWidget from "@/components/ChessWidget";
import ClashWidget from "@/components/ClashWidget";
import BulletIcon from "@/icons/BulletIcon";
import ImageStack from "@/components/ImageStack";
import HorizontalSlideshow from "@/components/HorizontalSlideshow";

export const metadata = {
  title: "About Me | Aidan Chien",
  description:
    "About Aidan Chien - software engineer specializing in cloud computing, AWS-integrated AI solutions, and intelligent applications. Learn more about my work and background.",
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

function BulletRow({ children }) {
  return (
    <div className="flex items-center gap-x-4">
      <BulletIcon className="text-highlight-color h-2 w-2 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="font-dm-sans font-medium">
      <div className="text-body-text min-h-[90vh]">
        <MaxWidthWrapper>
          <div className="mt-40 mb-6 grid grid-cols-2">
            <div className="">
              <h1 className="mb-8 text-4xl font-bold tracking-[0.2em] text-white">
                About Me
              </h1>
              {/* blurb section*/}
              <div className="text-body-text space-y-1 text-base">
                <BulletRow>
                  An Earthling Human, based in{" "}
                  <RedText rewardId="red:about:seattle">Seattle</RedText> and{" "}
                  <RedText rewardId="red:about:toronto">Toronto</RedText>
                </BulletRow>
                <BulletRow>
                  Studying Systems Design Engineering at the University of
                  Waterloo
                </BulletRow>
                <BulletRow>
                  A{" "}
                  <RedText rewardId="red:about:cloud">
                    software engineer
                  </RedText>{" "}
                  focused on cloud engineering and infrastructure (AWS)
                </BulletRow>
                <BulletRow>
                  Currently a Full Stack Technical Lead at NeedList.ORG
                </BulletRow>
              </div>
            </div>
            <div className="flex justify-end">
              <ImageStack />
            </div>
          </div>
          <div className="flex flex-col space-y-8">
            <div className="mb-8">
              <h1 className="mb-8 text-4xl font-bold tracking-[0.2em] text-white">
                Interests
              </h1>
              <div className="space-y-1">
                <BulletRow>
                  When I&apos;m not coding, I also love climbing, filmmaking,
                  video games, and music
                </BulletRow>
                <BulletRow>Check out some of my stats below!</BulletRow>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <SpotifyEmbed playlistId="1oQngKRVkU7oI8hmB4hf7i" theme={0} />
              {/* <ChessWidget className="flex-1" /> */}
              <ClashWidget className="flex-1" />
            </div>
            <HorizontalSlideshow />
          </div>
        </MaxWidthWrapper>
      </div>
    </main>
  );
}
