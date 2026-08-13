// Filled chevron: two 45-degree arms, ends cut vertically at the viewBox edges.
//
// THICKNESS is the vertical gap between the arms' top and bottom edges;
// perpendicular stroke weight is THICKNESS / sqrt(2), so ~2.3px at h-3. The
// shape is centered on 245.34 so the ink box doesn't shift if the weight is
// retuned.
const CENTER = 245.34;
const THICKNESS = 140;

const T = CENTER - 128 - THICKNESS / 2;
const B = T + THICKNESS;
const PATH = `M0,${T}L256,${256 + T}L512,${T}L512,${B}L256,${256 + B}L0,${B}Z`;

export default function ArrowDownChevron(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      {...props}
    >
      <path d={PATH} />
    </svg>
  );
}
