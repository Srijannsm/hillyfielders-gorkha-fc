import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getTeams } from '../services/api'
import TeamPageTabs from '../components/TeamPageTabs'
import SEO from '../components/SEO'
import PlayerCardSkeleton from '../components/skeletons/PlayerCardSkeleton'

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD']
const POSITION_LABELS = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' }

/* ── Player card ───────────────────────────────────────── */
function PlayerCard({ player }) {
  return (
    <div className="group bg-gfc-900 overflow-hidden border border-gfc-700 hover:border-gfc-lime hover:-translate-y-1 transition-all duration-200 ease-out">
      {/* Photo */}
      <div className="h-72 w-full relative overflow-hidden bg-gfc-800">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gfc-800">
            <svg viewBox="0 0 80 100" className="w-16 h-20" fill="currentColor" style={{ color: 'rgba(190,255,0,0.1)' }}>
              <circle cx="40" cy="28" r="18" />
              <path d="M5 98 C5 62 18 52 40 52 C62 52 75 62 75 98 Z" />
            </svg>
            <span className="font-black" style={{ fontSize: '28px', color: 'rgba(190,255,0,0.12)' }}>
              {player.jersey_number}
            </span>
          </div>
        )}
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gfc-900 via-transparent to-transparent" />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gfc-900/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-5 z-20">
          <p className="text-white font-black uppercase text-center text-sm leading-tight mb-2">
            {player.name}
          </p>
          <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">
            {player.position_display}
          </p>
          {player.nationality && (
            <p className="text-gray-400 text-xs mt-1.5">{player.nationality}</p>
          )}
        </div>
        {/* Jersey badge — bottom left */}
        <div className="absolute bottom-4 left-4 bg-gfc-lime text-gfc-900 font-black text-base w-10 h-10 flex items-center justify-center z-10">
          {player.jersey_number}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4 border-t border-gfc-700">
        <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest mb-1">
          {player.position_display}
        </p>
        <h3 className="text-white font-black uppercase text-base leading-tight">
          {player.name}
        </h3>
        {player.nationality && (
          <p className="text-gray-500 text-xs mt-1 font-medium">{player.nationality}</p>
        )}
      </div>
    </div>
  )
}

/* ── Staff card ────────────────────────────────────────── */
function StaffCard({ member }) {
  return (
    <div className="bg-white border border-gray-100 flex items-center gap-4 p-5 hover:border-gfc-700 transition-colors">
      <div className="bg-gfc-900 w-14 h-14 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gfc-lime text-xl font-black">
            {member.name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-900 font-black uppercase text-sm">{member.name}</p>
        <p className="text-gfc-700 text-xs font-bold uppercase tracking-wider mt-0.5">
          {member.role_display}
        </p>
      </div>
    </div>
  )
}

/* ── Section divider ───────────────────────────────────── */
function PositionSection({ label, count, children }) {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-5 mb-8">
        <h2 className="text-gray-900 font-black uppercase text-3xl border-l-4 border-gfc-lime pl-4">{label}</h2>
        <span className="bg-gfc-lime text-gfc-900 font-black text-xs px-3 py-1 uppercase tracking-wide">
          {count}
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ */
export default function Squad() {
  const { teamType } = useParams()

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <div className="bg-gfc-900 pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 w-36 bg-gfc-700/50 animate-pulse rounded mb-5" />
          <div className="h-14 w-72 bg-gfc-800 animate-pulse rounded" />
        </div>
      </div>
      <div className="h-1 bg-gfc-lime" />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <PlayerCardSkeleton count={8} />
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-400 font-semibold">Failed to load squad. Is Django running?</p>
    </div>
  )

  const team = teams?.find(t => t.slug === teamType)

  if (!team) return (
    <div>
      <section className="section-bg bg-gfc-900 text-white pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">Hillyfielders Gorkha FC</p>
          <h1 className="font-black uppercase" style={{ fontSize: 'clamp(48px, 8vw, 88px)', lineHeight: 1 }}>
            Squad
          </h1>
        </div>
      </section>
      <TeamPageTabs teamType={teamType} />
      <div className="bg-white min-h-[40vh] flex items-center justify-center px-6">
        <div className="text-center py-24">
          <div className="w-16 h-16 border-2 border-gray-200 flex items-center justify-center mx-auto mb-6">
            <span className="text-gfc-700 font-black text-xl">GFC</span>
          </div>
          <p className="text-gray-900 font-black uppercase text-xl mb-2">Squad Coming Soon</p>
          <p className="text-gray-400 text-sm">This team is being assembled. Check back soon.</p>
        </div>
      </div>
    </div>
  )

  const grouped = POSITION_ORDER.reduce((acc, pos) => {
    const inPos = team.players.filter(p => p.position === pos)
    if (inPos.length) acc[pos] = inPos
    return acc
  }, {})

  return (
    <div>
      <SEO
        title={team.name}
        description={`Meet the players of the ${team.programme_name} ${team.name} squad.`}
      />
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">{team.programme_name}</p>
            <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
              {team.name}
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest pb-1">
            {team.players.length} Players · Season 2025/26
          </p>
        </div>
      </section>

      <TeamPageTabs teamType={teamType} />

      {/* Lime divider */}
      <div className="h-1 bg-gfc-lime" />

      {/* Content (white) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">

          {/* Staff */}
          {team.staff.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-5 mb-8">
                <h2 className="text-gray-900 font-black uppercase text-2xl">Coaching Staff</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.staff.map(s => <StaffCard key={s.id} member={s} />)}
              </div>
            </div>
          )}

          {/* Players by position */}
          {Object.entries(grouped).map(([pos, players]) => (
            <PositionSection key={pos} label={POSITION_LABELS[pos]} count={players.length}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {players.map(p => <PlayerCard key={p.id} player={p} />)}
              </div>
            </PositionSection>
          ))}

          {team.players.length === 0 && (
            <div className="text-center py-24 border border-gray-100 bg-gray-50">
              <p className="text-gfc-700/20 font-black text-5xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
              <p className="text-gray-900 font-black uppercase text-xl mb-2">No Players Added Yet</p>
              <p className="text-gray-400 text-sm">Add players in the Django admin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
