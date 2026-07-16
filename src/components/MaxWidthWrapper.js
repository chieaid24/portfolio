// max-w-3xl (768px) is exactly the md breakpoint, so stepped padding left the
// 768-1023 band pinned at the cap with only the sm gutter: content came out
// 720px there, wider than the 704px it gets on desktop, and snapped back at lg.
// A fluid gutter ramps 16px -> 32px across 390px -> 768px of viewport and holds
// at 32px above that, so content rises to 704px and stays. The clamp bounds are
// the old px-4 and px-8, so phones and desktop are unchanged.
export default function MaxWidthWrapper({ children, className = "" }) {
  return (
    <div className={"mx-auto max-w-3xl px-[clamp(1rem,4.2vw,2rem)] " + className}>
      {children}
    </div>
  );
}
