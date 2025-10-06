'use client'

export default function ResponsiveFrame({
  children,
  ratio = "16 / 9", // any CSS aspect-ratio: "4 / 3", "1 / 1", etc.
  className = "",
}) {
  const base =
    "max-w-full mx-auto " +
    "w-[320px] sm:w-[420px] md:w-[560px] lg:w-[720px] xl:w-[960px] 2xl:w-[1120px] " +
    "relative overflow-show rounded-2xl pb-5 ";

  return (
    <div
      className={className ? `${base} ${className}` : base}
      style={{ aspectRatio: ratio }}
      role="group"
      aria-label="Widget frame"
    >
      {/* Fill the frame */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
