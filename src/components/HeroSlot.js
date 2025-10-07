'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import RotatingHeroText from './RotatingHeroText.js';
import { useSlotJiggle } from '@/lib/slot-jiggle-context';
import { useMoney } from "@/lib/money-context"
import HeroCorner from "@/icons/HeroCorner.js"

// tiny helper: true when ≥ lg (1024px)
function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)'); // Tailwind lg
    const onChange = (e) => setIsLgUp(e.matches);
    setIsLgUp(mq.matches); // initial
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return isLgUp;
}


export default function HeroSlot() {
  const textRef = useRef(null);
  const leverRef = useRef(null);
  const mobileBallRef = useRef(null);
  const shadowRef = useRef(null);
  const leverGroupRef = useRef(null);
  const isLgUp = useIsLgUp();


  const [scope, animate] = useAnimate();
  const { awardLever } = useMoney();

  const { hasBeenClicked, markClicked, ready: jiggleReady } = useSlotJiggle();
  const jiggleTimeoutRef = useRef(null);
  const duration = 0.6;
  const milliDuration = duration * 1000;

  // Jiggle animation function
  const jiggleAnimation = useCallback(async () => {
    if (hasBeenClicked) return; // Don't jiggle if already clicked

    const JiggleXPromise = animate(
      scope.current,
      {
        x: [0, -2, 0, -1, 0, -1, 0],
      },
      {
        duration: 0.7,
        ease: 'easeInOut',
        times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      }
    );

    const PulsePromise = animate(
      scope.current,
      {
        fill: ['#FF7D7D', '#fcc7c7', '#FF7D7D'],
      },
      {
        duration: 1,
        ease: 'easeInOut',
        times: [0, 0.2, 1],
      }
    );
    await Promise.all([JiggleXPromise, PulsePromise]);
  }, [hasBeenClicked, animate, scope]);

  // Jiggle animation function
  const underflowJiggle = useCallback(async () => {

    const JiggleXPromise = animate(
      leverGroupRef.current,
      {
        x: [0, -2, 0, -1, 0, -1, 0],
      },
      {
        duration: 0.7,
        ease: 'easeInOut',
        times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      }
    );

    const PulsePromise = animate(
      scope.current,
      {
        fill: ['#FF7D7D', '#fcc7c7', '#FF7D7D'],
      },
      {
        duration: 1,
        ease: 'easeInOut',
        times: [0, 0.2, 1],
      }
    );
    await Promise.all([JiggleXPromise, PulsePromise]);
  }, [animate, scope, leverGroupRef]);


  // Start jiggle cycle
  const startJiggleCycle = useCallback(() => {
    if (hasBeenClicked) return;

    const scheduleNextJiggle = () => {
      jiggleTimeoutRef.current = setTimeout(() => {
        if (!hasBeenClicked) {
          jiggleAnimation().then(() => {
            if (!hasBeenClicked) {
              scheduleNextJiggle();
            }
          });
        }
      }, 700);
    };

    scheduleNextJiggle();
  }, [hasBeenClicked, jiggleAnimation]);

  // Start jiggle cycle once the context is ready (so we respect localStorage)
  useEffect(() => {
    if (!jiggleReady) return;     // wait until we've read localStorage
    startJiggleCycle();
    return () => {
      if (jiggleTimeoutRef.current) clearTimeout(jiggleTimeoutRef.current);
    };
  }, [jiggleReady, hasBeenClicked, startJiggleCycle]); // re-check if user clicks in another tab


  function animateShadow({ ref, from, to, duration = 300 }) {
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const lerp = (a, b) => a + (b - a) * progress;

      ref.setAttribute('dx', lerp(from.dx, to.dx));
      ref.setAttribute('dy', lerp(from.dy, to.dy));
      ref.setAttribute('stdDeviation', lerp(from.blur, to.blur));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const leverAnim = async () => {
    await animate(leverRef.current, {
      rotate: [30, 150, 150, 30],
    }, {
      duration: duration,
      times: [0, 0.507, 0.6, 1],
      transformOrigin: 'center',
      ease: 'easeInOut',
    });
  };


  const pullLever = async () => {
    // Mark as clicked and clear any pending jiggle timeouts
    markClicked();
    if (jiggleTimeoutRef.current) {
      clearTimeout(jiggleTimeoutRef.current);
    }

    const successful = await awardLever();
    if (!successful) {
      underflowJiggle();
      return;
    }

    // Step 1: Smoothly increase the shadow
    if (shadowRef.current) {
      animateShadow({
        ref: shadowRef.current,
        from: { dx: 2, dy: 2, blur: 2 },
        to: { dx: -2, dy: 0, blur: 2 },
        duration: milliDuration * 0.5,
      });
    }

    // Start the animation, but don't await it yet
    const yAnimation = isLgUp ? animate(
      scope.current,
      {
        y: [0, 225, 225, 0],
      },
      {
        duration: duration,
        ease: 'easeInOut',
        transformOrigin: 'center',
        times: [0, 0.5, 0.6, 1],
      }
    ) : animate(
      scope.current,
      {
        y: [0, 210, 210, 0],
      },
      {
        duration: duration,
        ease: 'easeInOut',
        transformOrigin: 'center',
        times: [0, 0.5, 0.6, 1],
      }
    );


    const xAnimation = animate(
      scope.current,
      {
        x: [0, 20, 0, 0, 20, 0],
      },
      {
        duration: duration,
        times: [0, 0.25, 0.5, 0.6, 0.85, 1],
        ease: 'easeInOut',
      }
    );

    if (!isLgUp) {
      const mobileBall = mobileBallRef.current;
      if (!mobileBall) return;
      mobileBall.style.display = "none"; // disappears instantly
      // if you want to bring it back later:
      setTimeout(() => {
        mobileBall.style.display = "block";
      }, duration * 1000);
    }


    // Trigger textRef.next() halfway through the animation
    textRef.current?.next();

    setTimeout(() => {
      if (shadowRef.current) {
        animateShadow({
          ref: shadowRef.current,
          from: { dx: -2, dy: 0, blur: 2 },
          to: { dx: 2, dy: 2, blur: 2 },
          duration: milliDuration * 0.3,
        });
      }
    }, milliDuration * 0.7); // wait 600ms

    await leverAnim();
    // Wait for animation to finish
    await yAnimation;
  };

  return (
    <div className="flex flex-col justify-center w-[22rem] lg:w-[61rem] 5xl:w-[76rem] self-center bg-background-light shadow-[-4px_4px_4px_rgba(0,0,0,0.25)]">
      <div className="flex justify-between text-corner-orange mb-[-10px] mt-[10px] mx-[10px] lg:mb-[-30px] lg:mx-[40px] lg:pt-7.5
                                                                                              5xl:mb-[-37px] 5xl:mx-[50px] 5xl:pt-9"> {/**top corners div */}
        <HeroCorner className="w-8 h-8
        lg:w-16 lg:h-16 
        5xl:w-20 5xl:h-20 rotate-180" />
        <HeroCorner className="w-8 h-8 
        lg:w-16 lg:h-16 
        5xl:w-20 5xl:h-20 -rotate-90" />
      </div>
      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,3fr)] lg:grid-cols-[5fr_3fr] lg:gap-10 5xl:gap-30">
        <div className="self-center translate-x-[50px] lg:translate-x-[180px] 5xl:translate-x-[220px] cursor-default">
          {/* Rotating Text */}
          <RotatingHeroText
            ref={textRef}
            texts={['AIDAN', 'ENG', 'DES', 'INVE', 'CLIM', 'FILM', 'STU', 'GYM', 'CODE', 'CAD', 'REELS', 'GAME', 'UI/UX', 'WEB', 'AI', 'NYT', 'SLEEP', 'CHESS', 'DEVE']}
            texts2={['CHIEN', 'INEER', 'IGNER', 'NTOR', 'BER', 'MAKER', 'DENT', 'GOER', 'ADDICT', 'HEAD', 'SNOB', 'NERD', 'FAN', 'DEV', 'FIEND', 'GAMER', 'LOVER', 'NUT', 'LOPER']} // STAN, BUFF, BOY, BUG, ACE, 
            mainClassName="overflow-visible px-3 text-5xl lg:text-9xl 5xl:text-[160px] bg-background-light text-dark-grey-text font-italiana py-0.5 sm:py-1 md:py-2 5xl:py-[10px] justify-center rounded-lg"
            staggerFrom="last"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '120%' }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2000}
            auto={false}
          />
        </div>
        {/* SVG Lever Button */}
        <div
          ref={leverGroupRef}
          className=" flex items-center h-[80px] lg:h-[300px] 5xl:h-[375px]
            origin-top-left will-change-transform translate-y-3 lg:translate-0
            "
        >
          <div className="lg:m-5 h-full flex relative items-center "> {/**lever and block div */}
            <svg
              width={"90"}
              height={"140"}
              viewBox="0 0 90 140"
              className="p-0 scale-[0.5] lg:scale-100 5xl:scale-125"> {/**block svg */}
              <rect
                x="0"
                y="0"
                width={"90"}
                height={"140"}
                fill="#878787"
              />
            </svg>
            <svg
              width={"80"}
              height={"300"}
              viewBox="0 0 100 270"
              className="absolute translate-x-[25px] translate-y-[-3px] scale-[0.5] lg:translate-x-[45px] lg:translate-y-0 lg:scale-100 5xl:translate-x-[56px] 5xl:scale-125"


            > {/*lever svg*/}
              <motion.rect
                ref={leverRef}
                x="0"
                y="0"
                width={"25"}
                height={"270"}
                fill="#D9D9D9"
                initial={{ rotate: 30 }}
                className="translate-x-[-5px] lg:translate-x-[-10px] cursor-pointer"

              />
            </svg>
            {/**larger svg for mobile view so lever is easier to click */}
            {!isLgUp && (
              <svg
                width={"60"}
                height={"60"}
                viewBox="0 0 50 50"
                className="z-10 -translate-x-10 -translate-y-13"

              >
                <motion.circle
                  ref={mobileBallRef}
                  cx={'25'}
                  cy={'20'}
                  r={'30'}
                  fill="transparent"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="cursor-pointer"
                  onClick={pullLever}

                >
                </motion.circle>
              </svg>
            )}
          </div>

          <svg
            width={"100"}
            height={"500"}
            viewBox="0 0 100 100"
            className="absolute lg:relative translate-x-[27px] translate-y-[-5px] lg:translate-x-[-49px] lg:translate-y-[-10px] scale-47 lg:scale-100 5xl:scale-125 5xl:translate-x-[-30px] 5xl:translate-y-[-10px]"

          > {/**lever ball svg */}
            <defs>
              <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow ref={shadowRef} dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
              </filter>
            </defs>
            <motion.circle
              ref={scope}
              cx={'50'}
              cy={'-55'}
              r={'28'}
              fill="#FF7D7D"
              filter="url(#dropShadow)"
              whileTap={{ scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onClick={pullLever}
              className="cursor-pointer"
            >
            </motion.circle>
          </svg>
        </div>
      </div>
      <div className="flex justify-between text-corner-orange mt-[-10px] mb-[10px] mx-[10px] lg:mt-[-30px] lg:mx-[40px] lg:pb-7.5
                                                                                              5xl:mt-[-37px] 5xl:mx-[50px] 5xl:pb-9"> {/**bottom corners div */}
        <HeroCorner className="w-8 h-8 lg:w-16 lg:h-16 5xl:w-20 5xl:h-20 rotate-90" />
        <HeroCorner className="w-8 h-8 lg:w-16 lg:h-16 5xl:w-20 5xl:h-20" />
      </div>
    </div >
  );
}