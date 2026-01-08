"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RedText from "@/components/RewardRedText";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import ClashWidget from "@/components/ClashWidget";
import BulletIcon from "@/icons/BulletIcon";
import ImageStack from "@/components/ImageStack";
import HorizontalSlideshow from "@/components/HorizontalSlideshow";
import { motion } from "framer-motion";
import { experiences } from "@/app/data/experiences";

function BulletRow({ children }) {
  return (
    <div className="flex items-center gap-x-4 text-sm sm:text-base">
      <BulletIcon className="text-highlight-color h-2 w-2 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export default function AboutPage() {
  // states "Currently <Job Title>" if Job is working until the "present"
  // states "Previously <Job Title" if Job does not include "present"
  const currentOrPrev = () => {
    return experiences.work[0].period.toLowerCase().includes("present")
      ? "Currently"
      : "Previously";
  };

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
            <div className="mb-6 grid grid-cols-1 pt-35 md:grid-cols-2 md:pt-40">
              <div className="order-2 md:order-1">
                <h1 className="bg-background mb-4 text-2xl font-bold tracking-[0.2em] text-white sm:text-3xl md:mb-8 md:text-4xl">
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
                    {currentOrPrev()} a {experiences.work[0].title} at{" "}
                    {experiences.work[0].subtitle}
                  </BulletRow>
                </div>
              </div>
              <div className="order-1 mb-8 flex justify-start md:order-2 md:mb-0 md:justify-end">
                <ImageStack />
              </div>
            </div>
            <div className="flex flex-col space-y-6 md:space-y-8">
              <div className="mb-8">
                <h1 className="mb-4 text-2xl font-bold tracking-[0.2em] text-white sm:text-3xl md:mb-8 md:text-4xl">
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <motion.div
                  key="spotify"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: 0.25 }}
                >
                  <SpotifyEmbed playlistId="1oQngKRVkU7oI8hmB4hf7i" theme={0} />
                </motion.div>
                {/* <ChessWidget className="flex-1" /> */}
                <motion.div
                  key="clash"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: 0.4 }}
                >
                  <ClashWidget className="flex-1" />
                </motion.div>
              </div>
              <motion.div
                key="slideshow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.55 }}
              >
                <HorizontalSlideshow />
              </motion.div>
            </div>
          </div>
        </MaxWidthWrapper>
      </main>
    </>
  );
}
