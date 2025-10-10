<p align="center">
  <h1 align="left">--Personal Website Dev Notes--</h1>
</p>


<p align="center">
  <img width="300" height="90" alt="image" src="https://github.com/user-attachments/assets/744887ad-02b2-40e5-af47-a11571f243b9" />
</p>

# Updating Resume

- Every time I make a new resume, upload it to the `(aidanmchien) Google Drive -> IMPORTANT -> Aidan_Chien_resume --(right click)-> File information -> Manage versions`
- Upload here
----
<p align="center">
  <img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/b7f65b5e-033b-4f66-95bc-da81d92dc5a6" />
</p>

# Creating a New Project
### Add paragraph data
**(Path: src/app/data/projects.js)**
- There is an empty template with all the info needed, use other projects as examples.
  - Can have an unlimited number of paragraphs for each section
### Add <RedWords> to paragraphs
- Takes prop of rewardId, should be in the format of `red:[project]:[text]` (ex). `red:mbd:ux`
### Add image (card image)
- Will be rendered in (2:1) resolution
### Add page_display data
- Image paths should be stored in `public/[project_name]/example.png`
  - Will be rendered in (2:1) resolution
- 3D Model paths should be stored in `public/[project_name]/example.glb`
  - Can be saved to this format by saving a `.stp/.step -> FreeCad -> .stl -> Blender -> .glb`
- YouTube videos shared as their hyperlink (just in the URL bar), with just the 11 character code after `?v=`
### Add skills_used variable and <SkillDisplay> in paragraphs
- All goes through the `components/SkillDisplay` file
- Takes Icons from the `app/icons/skills` folder
  - The Icon’s file name is the default displayed text--this can be overridden by passing the displayName prop when using the `<SkillDisplay>` component (look at personal website -> tool_paragraphs -> Next.js)
- See “Adding a new SkillDisplay Icon” to add a new Skill
### Updating quest_totals
- At top of projects.js with redtext+=?, project++, link++
  - Update counts in comments

### Extra: Adding Links to external sites or internal other projects
- For internal other projects 
  - Ex) (PMI -> MBD Macro) pmi-auto-generator -> what_paragraphs -> <Link>
- For external sites 
  - Ex) (MBD Macro -> GitHub) mbd_macro -> what_paragraphs -> <Link>
-----
<p align="center">
  <img width="127" height="45" alt="image" src="https://github.com/user-attachments/assets/8739cf77-cbe4-40c3-818c-deda9e291fa7" />
</p>

# Adding a new SkillDisplay Icon
- Create a file in `src/icons/skills/*.js`
  - The Icon’s file name is the default displayed text
- Get the SVG from svgrepo or Simple Icons, paste the svg into figma, go into the code mode and take **just** the vector component.
  - Should be just `<svg> <path /> <svg>`
- Paste that into your created .js file 
- Remove the height & width in the `<svg> `tag, add `{...props}`, leave the `viewBox`
  - This makes it so the icon can still scale correctly, but I pass the value of its size and it takes that value
- In all of the `fill=` or `strokeColor=` make it equal to `white`
- 
------

<p align="center">
  <img width="202" height="116" alt="image" src="https://github.com/user-attachments/assets/32652c39-f66c-4617-bdff-131da600e8f1" />
</p>

# Adding new Commodities
**(Path: src/app/data/commodities.js)**
- These are the items in the expanded Header that “I would buy”

------

<p align="center">
  <img width="200" height="100" alt="image" src="https://github.com/user-attachments/assets/9f7709d8-c029-4bc7-85de-6d496922fc89" />
</p>

# Adding new Hero Rotating Texts
**(Path: src/app/components/HeroSlot.js)**
- These are the texts that describe be that scroll down when you pull the Hero Slot Lever

------
------
### Things to potentially change:
- Text color of the title in CommodityDisplay to header-light
- In WidgetCarousel, the arrow animation when it gets to the end, should not be animated when it ‘hits the wall’ ?
- Add TLDR section at the bottom of each project
- Maybe say “AI-Generated TLDR (did the work for you)” then 4-5 bulletpoints
- Potentially buy things with the money
-----
### Balance Value Notes
- Decimal Places: 2 decimal
- Minimum money: 0 (send special message ? BROKE etc.)
- Maximum money: 9999.99k (money-context)
- Start with -> 10k
- Each money gain:
- Red Word: 2.5k each (lib/money-context)
- Project: 4, 59 - 81k each (lib/ticket-store)
- Link followed: ~6, 12 - 32k each (lib/money-context
- Lever Click: - negative 5, gain statistical output (lib/payout-default & lib/payout)
- K, M, B, T, Q for units for the things you can buy

