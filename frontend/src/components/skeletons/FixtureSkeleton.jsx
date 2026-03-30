/* ── Fixture row skeleton ────────────────────────────────── */
function FixtureRowSkeletonItem() {
  return (
    <div className="border-b border-gray-100 p-6 animate-pulse flex flex-wrap md:flex-nowrap items-center gap-4">
      {/* Date + competition column */}
      <div className="w-full md:w-44 flex-shrink-0 space-y-2">
        <div className="h-2 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
        <div className="h-2 w-16 bg-gray-100 rounded" />
      </div>

      {/* Teams + score column */}
      <div className="flex-1 flex items-center gap-4">
        <div className="flex-1 h-5 bg-gray-200 rounded" /> {/* home team */}
        <div className="w-16 h-10 bg-gray-200 rounded" />  {/* score box */}
        <div className="flex-1 h-5 bg-gray-200 rounded" /> {/* away team */}
      </div>

      {/* Venue + badge column */}
      <div className="w-full md:w-44 flex-shrink-0 flex md:flex-col items-center md:items-end gap-3 md:gap-2">
        <div className="h-2 w-20 bg-gray-100 rounded" />
        <div className="h-5 w-12 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export default function FixtureSkeleton({ count = 5 }) {
  return (
    <div className="border border-gray-200">
      {Array.from({ length: count }).map((_, i) => (
        <FixtureRowSkeletonItem key={i} />
      ))}
    </div>
  )
}
