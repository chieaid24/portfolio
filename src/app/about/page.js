"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RedText from "@/components/RewardRedText";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import ClashWidget from "@/components/ClashWidget";
import BulletIcon from "@/icons/BulletIcon";
import ImageStack from "@/components/ImageStack";
import HorizontalSlideshow from "@/components/HorizontalSlideshow";
import Experience from "@/components/Experience";
import StarBackground from "@/components/StarBackground";

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
    <>
      <>
        <title>About Me | Aidan Chien</title>
        <meta
          name="description"
          content="About Aidan Chien - software engineer specializing in cloud computing, AWS-integrated AI solutions, and intelligent applications. Learn more about my work and background."
        />
      </>
      {/* <StarBackground /> */}
      <main className="font-dm-sans bg-background font-medium">
        <MaxWidthWrapper>
          <div className="text-body-text min-h-[90vh]">
            <div className="mb-6 grid grid-cols-2 pt-40">
              <div className="">
                <h1 className="bg-background mb-8 text-4xl font-bold tracking-[0.2em] text-white">
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
          </div>
        </MaxWidthWrapper>
      </main>
    </>
  );
}
