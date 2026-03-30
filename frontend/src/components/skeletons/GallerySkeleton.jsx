/* ── Gallery masonry skeleton ────────────────────────────── */
// Varying heights to mimic real masonry layout
const HEIGHTS = ['h-48', 'h-72', 'h-56', 'h-80', 'h-48', 'h-64', 'h-72', 'h-52']

export default function GallerySkeleton({ count = 8 }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gfc-800 animate-pulse mb-4 break-inside-avoid ${HEIGHTS[i % HEIGHTS.length]}`}
        />
      ))}
    </div>
  )
}
