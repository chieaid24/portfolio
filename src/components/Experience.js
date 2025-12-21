"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import Image from "next/image";
import BulletIcon from "@/icons/BulletIcon";
import { experiences } from "@/app/data/experiences";

const tabs = [
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
];

const badgeImagePath = "/company-images/waterloo-logo_v2.png";

function TimelineItem({ item }) {
  return (
    <div className="relative flex gap-3 sm:gap-6">
      <div className="h-10 w-10 overflow-hidden rounded-full border-1 border-white/20 sm:h-13 sm:w-13">
        <Image
          src={item.badge?.src ?? badgeImagePath}
          alt={item.badge?.alt ?? `${item.title} logo`}
          width={60}
          height={60}
          className="h-full w-full"
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="space-y-0">
          <h3 className="text-lg leading-tight font-semibold text-white sm:text-xl sm:leading-normal">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-md font-medium text-white/90">{item.subtitle}</p>
          )}
          {item.period && (
            <p className="text-sm text-gray-400">{item.period}</p>
          )}
        </div>

        <div className="space-y-1 font-light tracking-wide text-gray-100">
          {item.highlights.map((highlight, index) => (
            <div
              key={`${item.id}-highlight-${index}`}
              className="relative flex items-center gap-x-3 pl-0 sm:gap-x-4"
            >
              <BulletIcon className="text-highlight-color h-2 w-2 shrink-0" />
              <div className="space-y-0">
                <p className="text-body-text text-sm leading-tight sm:text-base">
                  {highlight.text}
                </p>
                {highlight.note && (
                  <p className="text-xs text-gray-400 sm:text-sm">
                    {highlight.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  const [activeTab, setActiveTab] = useState("work");
  const items = experiences[activeTab] ?? [];
  let [ref, { height }] = useMeasure();

  return (
    <section className="text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="bg-background border-outline-gray rounded-2xl border p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:text-base ${
                    isActive
                      ? "bg-highlight-color text-white shadow-[0_5px_30px_rgba(255,255,255,0.2)]"
                      : "cursor-pointer text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          animate={{ height, ease: "easeOut" }}
          transition={{ duration: 0 }}
          className="bg-background border-outline-gray rounded-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          <motion.div key={activeTab}>
            <div ref={ref} className="relative px-3 py-5 sm:px-6 sm:py-6">
              <div
                className="absolute top-0 bottom-0 left-[2rem] w-px bg-white/10 sm:left-[3.1rem]"
                aria-hidden="true"
              />
              <div className="z-10 space-y-8">
                {items.map((item, index) => (
                  <TimelineItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
