export default function MaxWidthWrapper({ children, className = "" }) {
  return (
    <div className={"mx-auto max-w-[900px] px-6 sm:px-12 " + className}>
      {children}
    </div>
  );
}
