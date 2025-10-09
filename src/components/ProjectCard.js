'use client';

import { useEffect, useMemo, useState } from "react";
import RewardProjectLink from "@/components/RewardProjectLink";
import Image from "next/image";
import { getOrCreateTicket } from "@/lib/ticket-store";
import Decimal from 'decimal.js';
import ProjectTicket from "@/icons/ProjectTicket";
import SkillDisplay from "@/components/SkillDisplay"


export default function ProjectCard({ title, generated_with, ticket_no, fallback_value, skills_used, image, slug }) {
    const [ticket, setTicket] = useState({
        number: ticket_no ?? "",
    });

    useEffect(() => {
        // seed with the prop once (if present), otherwise generate & persist
        const t = getOrCreateTicket(slug, {
            number: ticket_no,
        });
        setTicket(t);
    }, [slug, ticket_no]);

    const addedTicketValue = useMemo(() => {
        if (!ticket.value) return "0";
        const clean = String(ticket.value).replace(/[^0-9.-]/g, "");
        try {
            return new Decimal(clean).div(1000).toString();
        } catch {
            return "0";
        }
    }, [ticket.value]);

    return (
        <div>
            <RewardProjectLink href={`/projects/${slug}`} className="block font-dm-sans group/pc mobile:select-none" rewardId={`project:${slug}`} ticketValue={addedTicketValue}>
                <div className="flex relative justify-center">
                    <div className="relative w-[500px] 5xl:w-[596px] aspect-[2] overflow-hidden rounded-lg 5xl:rounded-xl shadow-[-4px_4px_4px_0px_rgba(0,0,0,0.25)] ">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover z-0 transition-transform duration-300 group-hover/pc:scale-101" />
                        <div role="group"
                            aria-label="Skills used in this project" 
                            className="absolute w-full pl-20 flex flex-wrap justify-end gap-2 pt-3 pr-3 text-[16px]"> {/**skills used div */}
                            {skills_used.map((skill, i) => (
                                <SkillDisplay fileName={skill} project={i} card={true} key={i}/>
                            ))}
                        </div>
                    </div>
                    <div className="absolute -translate-x-[4.4px] translate-y-[125%] group-hover/pc:translate-y-[121%] w-full flex flex-col items-center transition-transform duration-300 group-hover/pc:duration-300 group-hover/pc:scale-102">
                        <div className="relative">
                            {/* <CardLabel /> */}
                            <div className="text-[#fffbf6] dark:text-[#565860]">
                                <ProjectTicket className="w-[350px] h-[101px] sm:w-[459px] sm:h-[132px] 5xl:w-[551px] 5xl:h-[158px] " />
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-black dark:text-white w-full ml-[4px]">
                                <div className="font-bold text-[9px] sm:text-[11px] 5xl:text-[13px] mt-[-3px] sm:mb-[-5px] sm:mt-[-5px] 5xl:mb-[-6px] opacity-50">
                                    CASHOUT VOUCHER
                                </div>
                                <div className="text-dark-grey-text font-black text-[30px] sm:text-[39px] 5xl:text-[46px] my-[-10px] sm:my-[-9px] tracking-tight">
                                    {title}
                                </div>
                                <div className="overflow-hidden mt-[0px] sm:mt-[-6px] w-[180px] h-[21px] sm:w-[240px] sm:h-[30px] 5xl:w-[288px] 5xl:h-[36px] opacity-12 dark:opacity-25">
                                    <img
                                        src="/icons/barcode_hireme.svg"
                                        alt="Hire me barcode"
                                        className="block w-full h-auto dark:invert"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="flex justify-between font-bold w-[200px] sm:w-[260px] 5xl:w-[312px] opacity-50 mt-[2px] sm:mt-1">
                                    <div className="text-[8px] sm:text-[10px] 5xl:text-[12px]">GENERATED WITH: {generated_with}</div>
                                    <div className="text-[8px] sm:text-[10px] 5xl:text-[12px]">TICKET # {ticket.number || '—'}</div>
                                </div>
                                <div className="font-bold mt-[-3px] text-[12px] sm:text-[14px] 5xl:text-[17px] opacity-65">
                                    ${ticket.value || ' ——'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </RewardProjectLink>
        </div>

    );
}