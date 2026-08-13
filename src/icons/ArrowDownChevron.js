// Filled chevron: two 45-degree arms, ends cut vertically at the viewBox edges.
//
// `thickness` is the vertical gap between the arms' top and bottom edges (in
// viewBox units); perpendicular stroke weight is thickness / sqrt(2). The shape
// stays vertically centered on 245.34 as thickness changes, so a thinner chevron
// sits in the same place rather than drifting up.
const CENTER = 245.34;

export function chevronPath(thickness) {
  const t = CENTER - 128 - thickness / 2; // y of the top edge at x = 0
  const b = t + thickness;
  return `M0,${t}L256,${256 + t}L512,${t}L512,${b}L256,${256 + b}L0,${b}Z`;
}

export default function ArrowDownChevron({ thickness = 167, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      {...props}
    >
      <path d={chevronPath(thickness)} />
    </svg>
  );
}
