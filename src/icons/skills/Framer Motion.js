export default function FramerMotion({ color = "#0055FF", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 24"
      fill="none"
      {...props}
    >
      <path
        d="M0 0H16V8H8L0 0ZM0 8H8L16 16H0V8ZM0 16H8V24L0 16Z"
        fill={color}
      />
    </svg>
  );
}
