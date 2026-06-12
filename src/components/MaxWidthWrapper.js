export default function MaxWidthWrapper({ children, className = "" }) {
  return (
    <div className={"mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 " + className}>
      {children}
    </div>
  );
}
