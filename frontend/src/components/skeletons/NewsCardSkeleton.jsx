/* ── News card skeleton ──────────────────────────────────── */
function NewsCardSkeletonItem({ tall = false }) {
  return (
    <div className={`bg-gray-100 animate-pulse overflow-hidden ${tall ? 'min-h-[420px]' : 'min-h-[260px]'} relative`}>
      {/* Image placeholder — fills the whole card */}
      <div className="absolute inset-0 bg-gray-200" />

      {/* Text overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
        <div className="h-2 w-16 bg-gray-300 rounded" />  {/* category */}
        <div className="h-4 w-full bg-gray-300 rounded" /> {/* title line 1 */}
        {tall && <div className="h-4 w-3/4 bg-gray-300 rounded" />} {/* title line 2 (featured) */}
        <div className="h-2 w-24 bg-gray-300 rounded mt-1" /> {/* date */}
      </div>
    </div>
  )
}

export default function NewsCardSkeleton({ count = 6 }) {
  return (
    <>
      {/* Hero — full width */}
      <div className="mb-4">
        <NewsCardSkeletonItem tall />
      </div>

      {/* Articles 2 & 3 — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <NewsCardSkeletonItem />
        <NewsCardSkeletonItem />
      </div>

      {/* Remaining — 3-column grid */}
      {count > 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(count - 3, 3) }).map((_, i) => (
            <NewsCardSkeletonItem key={i} />
          ))}
        </div>
      )}
    </>
  )
}
