import Link from "next/link";
import RedText from "@/components/RewardRedText";
import SkillDisplay from "@/components/SkillDisplay";

export const quest_totals = {
  // Home: 3 | About: 5 | PMI: 9 | Website: 11 | 3D Tools: 5 | MBDMacro: 7 | AI Sleep: 10
  // CURR TOTAL: 50
  redtext: 50,

  // OnePerProject: 5
  // CURR TOTAL: 5
  project: 5,

  // Header: 2 | Home: 1 | Footer: 2 | OnePerProject: 5
  // CURR TOTAL: 10
  link: 10,
};

/*  EMPTY TEMPLATE FOR NEW PROJECT!

    {
        slug: '', 
        title: '',
        generated_with: 'PYTHON + AHK', // appears on Card, what tools did you use?
        ticket_no: "25", //hard coded fall back value that will appear if actual random generation goes wrong,
        fallback_value: "17,230.00", //fallback ticket value that should be in this format (between 15000 and 18000, with comma, rounded to 10s place)
        skills_used: ['Python', 'OOP'], // orange labels that appear on Card, rendered by components/SkillDisplay (icon with matching name should exist in app/icons/skills)
        image: '/pmi_auto_generator/PMI Card2.png', // Card background image, 1536 x 768px
        page_displays: [['/pmi_auto_generator/pmi_card.png', 'Example 3D model with attached PMI'], ['/pmi_auto_generator/pmi_card.png']], // list range(1-2) of lists range(1-2). Bigger list is each Display which contains its path and its subtitle. Subtitle not req. 
        github_link: 'https://github.com/chieaid24/PMI-Auto-Generator-Desc',
        subtitle: "a machinist's best friend", // tagline that appears below the title on the Page
        summaryMetaData: "PMI Auto Generator speeds up machinist workflows by 30%, automating CAD annotation with Python + AHK." //60-150 character desc. for the SEO (just ask ChatGPT to summarize the project into a few words)
        summary: <> </>, // summary on the landing section of the Page
        tool_paragraphs: [ //What Tools?
            <> 

            </>,
        ],
        why_paragraphs: [ // Why this Project?
            <>

            </>,
            <>

            </>
        ],
        what_paragraphs: [ // What is this project?
            <>

            </>,
            <>

            </>,
        ],

        learning_paragraphs: [ // What did I learn?
            <>

            </>,
        ],
    },  

    */

//slugs of the four currently "featured" projects on the home page
export const featuredList = [
  "ai-sleep-analytics",
  "pmi-auto-generator",
  "personal-website",
  "mbd-macro",
];

// image / second_image can also be 3D models, and will be conditionally rendered as so on the page
export const projects = [
  {
    slug: "ai-sleep-analytics",
    title: "AI Sleep Analytics",
    skills_used: ["Python", "JupyterLab", "AWS", "scikit-learn"],
    image: "/ai-sleep-analytics/ai-card-3.png",
    page_displays: [
      [
        "https://youtu.be/fvlz57VK23c",
        "Check out the dashboard visualization!",
      ],
    ],
    github_link: "https://github.com/chieaid24/AI-Sleep-Analytics",
    subtitle: "sleep apnea's worst nightmare",
    summaryMetaData:
      "PMI Auto Generator speeds up machinist workflows by 30%, automating CAD annotation with Python + AHK.",
    summary:
      "End-to-end AWS-powered ML pipeline that cleans and models two years of CPAP sleep data using Random Forest regression and Prophet forecasting.",
    background: (
      <>
        As someone who&apos;s lived with sleep apnea my whole life, I&apos;ve
        always wondered how my sleep patterns have changed over time. So, I
        collected two years of CPAP machine data and analyzed it with a{" "}
        <RedText rewardId="red:sleep:random-forest">Random Forest</RedText>{" "}
        regression model and a{" "}
        <RedText rewardId="red:sleep:forecasting">forecasting</RedText>{" "}
        model—check out what I found!
      </>
    ),
    tool_paragraphs: [
      <>
        I developed in <SkillDisplay fileName="Python" project="sleep" /> and{" "}
        <SkillDisplay fileName="JupyterLab" project="sleep" /> within the{" "}
        <SkillDisplay fileName="AWS SageMaker Studio" project="sleep" /> IDE,
        using Pandas and{" "}
        <SkillDisplay fileName="AWS Glue" project="sleep">
          AWS Glue
        </SkillDisplay>{" "}
        for data preparation and{" "}
        <SkillDisplay fileName="AWS S3" project="sleep">
          AWS S3
        </SkillDisplay>{" "}
        for storage. I also used scikit-learn models and Meta&apos;s Prophet
        model as jumping off points.
      </>,
    ],
    why_paragraphs: [
      <>
        After completing my AWS AI Practitioner and Associate ML Engineer
        certifications, I wanted to create a simple machine learning project
        leveraging AWS services to put my skills into practice. Around the same
        time, I found out that my CPAP (Continuous Positive Airway Pressure)
        machine had been tracking and storing my sleep data for the past two
        years, and I was able to download the bulk of it as a CSV file. So, I
        decided to use machine learning models to find out (a) what factors
        contributed to the CPAP company&apos;s proprietary “Sleep Score” metric
        and (b) what my predicted sleep metrics might look like a week into the
        future.
      </>,
    ],
    what_paragraphs: [
      <>
        First, I had to clean and normalize the data, as the{" "}
        <RedText rewardId="red:sleep:600">600+ nights</RedText> of data and{" "}
        <RedText rewardId="red:sleep:40">40+ features</RedText> in the CSV file
        contained a lot of unnecessary information (like the company&apos;s
        DynamoDB specifications). This included dropping rows with missing
        entries, and choosing features that would produce the best model
        predictions.
      </>,
      <>
        For the regression model predicting my “Sleep Score”, I tested Linear
        Regression, Random Forest, XGBoost, and Neural Network Regressor models
        on the data to find the most fitting model for the task—resulting in
        scikit-learn&apos;s Random Forest model performing the best. Check out
        the
        <Link
          href="https://github.com/chieaid24/AI-Sleep-Analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="italic transition hover:opacity-80"
        >
          {" "}
          GitHub
        </Link>{" "}
        for a more detailed analysis. I then applied Bayesian Optimization to
        further fine tune the model to my data, resulting in an R² value of 0.99
        and RMSE of 0.28.{" "}
      </>,
      <>
        Regarding the forecast model, I selected five of the most important
        sleep metrics (i.e. usage hours, sleep score, etc), and created time
        series models for each with Meta&apos;s Prophet. I also analyzed weekly
        seasonality trends within the data, leading to interesting discoveries
        like my usage hours being the lowest on Sundays and highest on Saturdays
        on average. Finally, I created a dashboard visualization with Streamlit,
        creating interactive graphs and tables of the model&apos;s predictions.
      </>,
    ],

    learning_paragraphs: [
      <>
        This project allowed me to apply machine learning techniques such as
        feature engineering and{" "}
        <RedText rewardId="red:sleep:fine-tuning">fine-tuning</RedText> on a
        dataset that was personal to me, as well as learn the AWS ecosystem with
        hands-on experience. Overall, it was rewarding to take an end-to-end
        approach with a project close to my heart, and I hope that all this data
        might finally convince me to sleep earlier :).
      </>,
    ],
  },

  {
    slug: "personal-website",
    title: "Personal Website",
    skills_used: [
      "Next/Next.js",
      "React",
      "Tailwind CSS",
      "JavaScript",
      "Framer Motion",
      "Three/Three.js",
    ],
    image: "/personal_website/website_card.png",
    page_displays: [
      [
        "/personal_website/website3-image-1_v5.png",
        "Phone, tablet, and desktop views of the website",
      ],
    ],
    github_link: "https://github.com/chieaid24/Portfolio-Site",
    subtitle: "a portfolio that performs",
    summaryMetaData:
      "An interactive Next.js portfolio with gamified balance, slot machine, APIs, and creative UI/UX design.",
    summary:
      "A plain resume displaying my projects is boring and, frankly, too easy to make. Find out how I built the very website you're on from scratch!",
    background: (
      <>
        A plain resume displaying my projects is boring and, frankly, too easy
        to make. Find out how I built the{" "}
        <RedText rewardId="red:website:very-website">very website</RedText>{" "}
        you&apos;re on{" "}
        <RedText rewardId="red:website:scratch">from scratch!</RedText>{" "}
      </>
    ),
    tool_paragraphs: [
      <>
        The main framework I used was{" "}
        <SkillDisplay fileName="Next" project="website" displayName="Next.js" />{" "}
        with <SkillDisplay fileName="React" project="website" />, styled using{" "}
        <SkillDisplay fileName="Tailwind CSS" project="website" /> and{" "}
        <SkillDisplay fileName="Framer Motion" project="website" />. I also used{" "}
        <SkillDisplay fileName="Node" project="website" displayName="Node.js" />{" "}
        to connect with REST APIs for real-time updates,{" "}
        <SkillDisplay fileName="Figma" project="website" /> to prototype the
        interface, <SkillDisplay fileName="Illustrator" project="website" /> to
        create my logo and other assets, and Vercel for deployment.
      </>,
    ],
    why_paragraphs: [
      <>
        The main motivation for the site was to create an interactive and fun
        user experience, encouraging users to explore every aspect of the site
        and learn more about me in the process. The slot machine concept was
        something that I came up with a long time ago, and I rolled with it,
        creating an overarching theme for the site.
      </>,
    ],
    what_paragraphs: [
      <>
        The main component of the site is your “balance,” which is persisted
        throughout the app and stored in the browser&apos;s local storage. The
        user can increase their balance by clicking on{" "}
        <RedText rewardId="red:website:red">red words</RedText>, project links,
        and external links, as well as gambling with the home-page slot machine.
        All the states for whether or not a link has been clicked are also
        stored in local storage, and the user&apos;s progress can be tracked in
        the expanded header. Completing all of the quests allows the user to
        access a dark-mode toggle that applies throughout the app.
      </>,
      <>
        On the backend side, I read from the Chess.com REST API and Clash Royale
        REST API daily using my Node.js backend, and cache the values for a week
        to create fallback values in case of failure. These values are displayed
        with custom widgets on my About page. Additionally, I use a Vercel cron
        job every month to update my “Monthly Top 5” playlist using the Spotify
        API, which is displayed via the Spotify web embed.
      </>,
      <>
        The slot machine component was created using SVGs and Framer Motion, and
        is set to show an “inquiry animation” when it hasn&apos;t been pulled
        yet (state stored in the browser&apos;s local storage). The payout is
        calculated using a statistical mixture model made up of a triangularly
        distributed base and a power-law tail distribution. I designed it so
        that 10% of spins are jackpots (drawn from the tail). The remaining 90%
        come from the “base” of the model, which has an expected payout of $4.50
        to balance things out. This gives the users an incentive to continue
        trying their chances while being an unrealistic machine, since the user
        can actually profit.
      </>,
    ],

    learning_paragraphs: [
      <>
        I improved my UI/UX (accessibility, motion design, etc.) skills, as I
        think the main motivation for the creator of a project like this is for
        the user to effectively understand who I am as a professional, as well
        as a glimpse of my personality through creative design choices. Working
        through the large scale architecture and the tiny details forced me to
        build{" "}
        <RedText rewardId="red:website:bulletproof">bulletproof code</RedText>{" "}
        that balanced performance, an adaptive layout, and future scalability
        considerations. Lastly I learned a lot about myself when trying to
        create the “About” section, as it turns out I&apos;m not as interesting
        as I thought before.
      </>,
    ],
  },
  {
    slug: "pmi-auto-generator",
    title: "PMI Auto Generator",
    skills_used: ["Python", "AutoHotKey"],
    image: "/pmi_auto_generator/pmi_card.png",
    page_displays: [
      [
        "/pmi_auto_generator/pmi_img_1_v6.png",
        "Example 3D model with attached PMI",
      ],
      ["https://www.youtube.com/watch?v=GMJ6381breo", "Project demo video!"],
    ],
    github_link: "https://github.com/chieaid24/PMI-Auto-Generator-Desc",
    subtitle: "a machinist's best friend",
    summaryMetaData:
      "PMI Auto Generator speeds up machinist workflows by 30%, automating CAD annotation with Python + AHK.",
    summary:
      "Manually transferring info from a technical drawing to a 3D CAD model can be tedious and the worst part of a machinist's day. Keep scrolling to find out how I cut production time by 30 percent!",
    background: (
      <>
        Manually transferring info from a{" "}
        <RedText rewardId="red:pmi:technical-drawing">
          technical drawing
        </RedText>{" "}
        to a 3D <RedText rewardId="red:pmi:CAD-model">CAD model</RedText> can be
        tedious and the worst part of a machinist&apos;s day. Keep scrolling to
        find out how I cut production time by{" "}
        <RedText rewardId="red:pmi:30-percent">30 percent</RedText>!{" "}
      </>
    ),
    tool_paragraphs: [
      <>
        I used <SkillDisplay fileName="Python" project="pmi" /> for the logic
        and <SkillDisplay fileName="AutoHotKey" project="pmi" /> for easy
        interfacing with applications. I also utilized MBDVidia&apos;s OCR for
        data extraction and file conversion.
      </>,
    ],
    why_paragraphs: [
      <>
        Working with CNC machinists at Autonomous Machining opened my eyes to
        the many unexpected challenges that come with producing machined parts,
        especially precision parts for aerospace and automotive systems. At
        first, I thought the buyer companies just sent a SOLIDWORKS model, the
        machinist hit a few buttons, and the machine would cut it out—simple,
        like a 3D printer. However, I quickly learned that this isn&apos;t the
        case, and there are very good reasons to why machinists get paid in this
        economy.
      </>,
      <>
        As a machinist, it makes life a lot easier to have a 3D model that
        includes Product and Manufacturing Information (PMI), such as desired
        dimensions, tolerances, and specifications. This allows you to create
        machine paths and quality assurance procedures to the specs of the
        buyer. But due to old-fashioned &quot;this is the way it&apos;s always
        been done&quot; practices, many times the machine shop only receives a
        stripped-down (no PMI){" "}
        <RedText rewardId="red:pmi:3dmodel">3D model</RedText> and a{" "}
        <RedText rewardId="red:pmi:2dpdf">2D PDF</RedText> containing the
        necessary specifications. Someone then must manually annotate the model,
        which is a tedious and time-consuming task, especially for a small team
        like the one I worked with at my internship. Seeing this, I realized it
        had to change, and that was the birth of my PMI Auto Generator.
      </>,
    ],
    what_paragraphs: [
      <>
        Building on a blank 3D model and a PDF containing the necessary
        specifications, this is a Python application built to automatically
        attach all diameter annotations directly onto the 3D model. To format
        the files as needed, I created an AutoHotKey script to run on MBDVidia,
        the MBD software we used in the shop to attach the annotations. With a
        generated UI, the program guides the user to extract the annotations
        from the PDF into an Excel sheet, and convert the 3D model .stl or
        .sldprt file to a .qif file.
      </>,
      <>
        The .qif file is the key that my program relies on, as its{" "}
        <RedText rewardId="red:pmi:xml">XML structure</RedText> allows me to
        parse and insert information without a GUI. This unlocks automation and
        greater speed capabilities, which I take advantage of through this
        project. Now, using Python with NumPy and openpyxl, it scrapes the Excel
        file and formats each entry to scan for diameter annotations. I&apos;ve
        picked diameter annotations because the shop mostly worked with turned
        (cylindrical) parts, so diameter annotations made up about one-third of
        all dimensions.
      </>,
      <>
        The program then gets all of the dimensions from the model .qif file and
        cross-references each with the desired diameter dimensions. Lastly, it
        inserts those annotations onto the model. Then the user can simply open
        the .qif file and attach the rest of the annotations manually with the
        help of my{" "}
        <Link href="/projects/mbd-macro">
          <span className="italic transition hover:opacity-80">MBD Macro</span>
        </Link>
        . This project single-handedly saves around 30% of the total annotation
        time, and the full process takes only about 60 seconds to complete.
      </>,
    ],

    learning_paragraphs: [
      <>
        I strengthened my Python and scripting skills, as well as my
        understanding of best practices for writing scalable and intuitive code
        such that non-experts could understand and use it effectively. This
        included creating{" "}
        <RedText rewardId="red:pmi:sop">Standard Operating Procedures</RedText>{" "}
        (SOP) documentation and oral presentations to the team. Some challenges
        that I faced included extracting data from non-standard part drawing
        PDFs, as well as completely reverse-engineering the QIF format with few
        available resources. This project also attracted the attention of the
        company&apos;s CEO, who invited me to present my work to the parent
        company, and I received a light round of applause as I concluded.
      </>,
    ],
  },
  {
    slug: "3d-tools",
    title: "3D Printed Tools",
    skills_used: ["SOLIDWORKS"],
    image: "/printed_tools/printed_card.png",
    page_displays: [
      ["/printed_tools/keyassembly03.glb"],
      ["/printed_tools/remoteholder.glb"],
    ],
    github_link:
      "https://github.com/chieaid24/Design_Portfolio/tree/main/SOLIDWORKS/BUILD%20PICS",
    subtitle: "where form meets functional",
    summaryMetaData:
      "Custom 3D printed key and remote holders designed in SOLIDWORKS, combining function, ergonomics, and office branding.",
    summary:
      "A messy and unorganized workspace is both unprofessional and inefficient Keep reading to find out how I solved problems while creating conversation pieces for the office!",
    background: (
      <>
        A messy and unorganized workspace is both{" "}
        <RedText rewardId="red:tools:unprofessional">unprofessional</RedText>{" "}
        and <RedText rewardId="red:tools:inefficient">inefficient</RedText>.
        Keep reading to find out how I solved problems while creating{" "}
        <RedText rewardId="red:tools:conversation-pieces">
          conversation pieces
        </RedText>{" "}
        for the office!
      </>
    ),
    tool_paragraphs: [
      <>
        I designed everything in{" "}
        <SkillDisplay fileName="SOLIDWORKS" project="tools" /> and printed with
        the Markforged software, on FDM carbon-fiber reinforced filaments. I
        also sanded and spray painted when necessary.
      </>,
    ],
    why_paragraphs: [
      <>
        Looking around my office workspace, I felt an urge to make everything as
        efficient as possible—and that meant it had to be organized. Firstly, I
        saw that we had a pile of assorted keys that just sat on a desk, and
        three remotes that were scattered across the conference room table.
        There was no good way to store or organize these objects, so they had to
        be strewn around or, at best, lined up in a neat row. Seeing this, I
        realized something had to change.
      </>,
    ],
    what_paragraphs: [
      <>
        Regarding my keyholder, it is composed of four unique parts: a base, a
        top and bottom half of the structure, and the key holders themselves. In
        my design process, there were many printer considerations that I had to
        make, such as by hollowing out the base or splitting the main structure
        to fit into the printer&apos;s constraints. After designing in
        SOLIDWORKS, and using Markforged&apos;s proprietary printing software,
        Eiger, they came out of the printer with both additive and subtractive
        deformities. I realized that this was part of the printing process
        however, and was determined to make do with what I had. I used a
        combination of dry and wet sandpaper to sand the piece down as best I
        could, and then used a black spray paint to cover up the imperfections.
        Lastly, I super glued the component parts together to finish the
        project.
      </>,
      <>
        For the remote holder, I created the ergonomic and accessible design by
        taking measurements directly from the remotes. The design is made up of
        a main piece that holds a flat Logitech camera controller and two side
        pieces that hold identical TV remotes. I added left and right (L and R)
        indicators for each of the remotes, as well as a company logo to the
        base pad for extra customization. Building off of my keyholder project,
        I created a keyed joint attachment system for the sides to the base.
        This meant that it didn&apos;t require super glue, and could easily be
        disassembled while maintaining structural stability during use.
      </>,
    ],

    learning_paragraphs: [
      <>
        In the design process, incorporating{" "}
        <RedText rewardId="red:tools:ux-considerations">
          UX considerations
        </RedText>{" "}
        and real-life measurements allowed me to create ergonomic yet functional
        pieces for the workspace. Additionally, I designed for manufacturability
        by putting into account possible manufacturing failure and ensuring ease
        of printing. All in all, I was able to quickly and elegantly solve a
        physical problem in my office, while reinforcing my team&apos;s brand
        identity.
      </>,
    ],
  },
  {
    slug: "mbd-macro",
    title: "MBD Macro",
    skills_used: ["AutoHotKey"],
    image: "/mbd_macro/mbd_card.png",
    page_displays: [
      ["https://www.youtube.com/watch?v=7-iw15DLMDQ", "Project demo video!"],
    ],
    github_link: "https://github.com/chieaid24/MBD-Macro",
    subtitle: "streamlining software to your workflow",
    summaryMetaData:
      "An AutoHotKey macro app for MBDVidia that automates annotations, speeding machinist workflows with hotkeys and UI overlays.",
    summary:
      "Being a machinist requires you to spend hours annotating and processing every part that comes through the shop. I built an app that increases your efficiency by up to 100%",
    background: (
      <>
        Being a machinist requires you to{" "}
        <RedText rewardId="red:mbd:spend-hours">spend hours</RedText> annotating
        and processing every part that comes through the shop. I built an app
        that increases your efficiency by{" "}
        <RedText rewardId="red:mbd:100%">up to 100%</RedText>—keep scrolling to
        learn more!
      </>
    ),
    tool_paragraphs: [
      <>
        The script is built in{" "}
        <SkillDisplay fileName="AutoHotKey" project="mbd" />, a{" "}
        <SkillDisplay fileName="CPP" project="mbd" displayName="C++" /> based
        scripting language for easy interfacing with applications, and built for
        Capvidia&apos;s MBDVidia.
      </>,
    ],
    why_paragraphs: [
      <>
        For every part that comes through a machine shop, skilled machinists
        need a three-dimensionally annotated model, meaning a 3D model whose
        features include dimension and tolerance information embedded in the
        file itself. Many times, the machinists aren&apos;t sent this file, but
        instead a stripped 3D model (with no annotations) and a PDF part drawing
        with the desired specification.
      </>,
      <>
        Every time, someone must transfer the information from the PDF to the
        model using an MBD (Model Based Definition) software, like MBDVidia. I
        was tasked with doing this at first, and after a few hours, I realized
        how repetitive the actions I was taking were. For 90% of the
        annotations, the process would be exactly the same, and navigating the
        slightly clunky software made it even more tedious. So I decided to
        create a macro application that would automate repeated button presses
        and mouse clicks for our exact workflow.
      </>,
    ],
    what_paragraphs: [
      <>
        This is an application that, when launched, creates a graphical overlay
        and event listeners on top of MBDVidia, enabling hotkey-based controls
        that trigger scripts, manipulate windows, and interact with{" "}
        <RedText rewardId="red:mbd:gui">GUI elements</RedText>. This means that
        previously manual and tedious processes become nearly instantaneous.
        This program supports the creation of dimensional and geometric
        tolerances by setting keybinds to common functions. To achieve this, the
        program uses multithreaded processing and image detection, as well as
        window and keyboard/mouse manipulation.
      </>,
      <>
        For example, for dimensional tolerances (tolerancing the distance
        between two planes), after the hotkey is pressed, the program listens
        for the user&apos;s inputs and when necessary, will automatically pop up
        a chat box, which the user can input their desired tolerance and the
        macro will do the rest of the work. For most dimensions, this process is{" "}
        <RedText rewardId="red:mbd:2-3">2 to 3 times</RedText> faster than
        entering the information manually, and there are failsafes to dismiss
        the macro when the tolerance requires more manual input. In addition,
        the program includes overall quality of life improvements that increase
        both efficiency and user experience. More information can be found on
        the{" "}
        <Link
          href="https://github.com/chieaid24/MBD-Macro"
          target="_blank"
          rel="noopener noreferrer"
          className="italic transition hover:opacity-80"
        >
          GitHub
        </Link>
        , which goes through all the possible shortcuts and explanations.
      </>,
    ],

    learning_paragraphs: [
      <>
        Completing this process improved my{" "}
        <RedText rewardId="red:mbd:ux">user experience design</RedText> skills,
        as it required me to consider all possibilities, such as ease of
        learning (ex. UI indicators) and incorporating failsafes (ex. LOTS of
        error handling). Additionally, improving existing software forced me to
        think creatively, taking advantage of its strengths while finding
        workarounds for its limitations.
      </>,
    ],
  },
];

// Helper function to get project by slug
export const getProjectBySlug = (slug) => {
  return projects.find((project) => project.slug === slug);
};

export default projects;
