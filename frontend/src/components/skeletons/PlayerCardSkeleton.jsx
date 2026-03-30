/* ── Player card skeleton ────────────────────────────────── */
function PlayerCardSkeletonItem() {
  return (
    <div className="bg-gfc-900 border border-gfc-700 overflow-hidden animate-pulse">
      {/* Photo area */}
      <div className="h-72 w-full bg-gfc-800 flex flex-col items-center justify-center gap-4 p-6">
        {/* Circle avatar */}
        <div className="w-20 h-20 rounded-full bg-gfc-700" />
        {/* Jersey number box */}
        <div className="w-10 h-10 bg-gfc-700" />
      </div>
      {/* Info area */}
      <div className="px-4 pt-3 pb-4 border-t border-gfc-700 flex flex-col gap-2">
        <div className="h-2 w-12 bg-gfc-700 rounded" />  {/* position */}
        <div className="h-4 w-full bg-gfc-700 rounded" /> {/* name */}
        <div className="h-2 w-16 bg-gfc-800 rounded" />  {/* nationality */}
      </div>
    </div>
  )
}

export default function PlayerCardSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <PlayerCardSkeletonItem key={i} />
      ))}
    </div>
  )
}
