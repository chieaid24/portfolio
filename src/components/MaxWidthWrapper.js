export default function MaxWidthWrapper({ children, className = "" }) {
  return (
    <div
      className={
        "mx-auto max-w-[900px] border-none border-white px-6 md:px-12 " +
        className
      }
    >
      {children}
    </div>
  );
}
