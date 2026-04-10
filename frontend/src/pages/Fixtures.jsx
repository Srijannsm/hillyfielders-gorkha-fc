import { useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamBySlug, getFixtures } from '../services/api'
import TeamPageTabs from '../components/TeamPageTabs'
import SEO from '../components/SEO'
import FixtureSkeleton from '../components/skeletons/FixtureSkeleton'
import ErrorMessage from '../components/errors/ErrorMessage'
import InlineError from '../components/errors/InlineError'

const RESULT_STYLE = {
  W: { bg: 'bg-green-500', text: 'text-white', label: 'W' },
  L: { bg: 'bg-red-600', text: 'text-white', label: 'L' },
  D: { bg: 'bg-gray-500', text: 'text-white', label: 'D' },
}

/* ── Fixture row ───────────────────────────────────────── */
function FixtureRow({ fixture }) {
  const result = RESULT_STYLE[fixture.result]

  return (
    <div className={`group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors p-6 border-l-4 ${fixture.is_home_game ? 'border-l-gfc-lime' : 'border-l-transparent'
      }`}>
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">

        {/* Date + competition */}
        <div className="w-full md:w-44 flex-shrink-0">
          <p className="text-gfc-700 text-[10px] font-black uppercase tracking-widest">
            {fixture.competition_name || 'Friendly'}
          </p>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            {new Date(fixture.date).toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
          <p className="text-gray-400 text-xs">
            {new Date(fixture.date).toLocaleTimeString('en-GB', {
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Teams + score */}
        <div className="flex-1 flex items-center gap-4">
          <p className={`flex-1 text-right font-bold text-lg leading-snug ${fixture.is_home_game ? 'text-gray-900' : 'text-gray-400'
            }`}>
            {fixture.home_team_name}
          </p>

          {fixture.is_completed ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-gfc-900 text-white font-black text-xl px-5 py-2 min-w-[72px] text-center tabular-nums">
                {fixture.home_score}–{fixture.away_score}
              </span>
              {result && (
                <span className={`${result.bg} ${result.text} text-xs font-black w-7 h-7 flex items-center justify-center`}>
                  {result.label}
                </span>
              )}
            </div>
          ) : (
            <span className="bg-gfc-lime text-gfc-900 font-black text-sm px-6 py-3 uppercase tracking-widest flex-shrink-0 animate-pulse">
              VS
            </span>
          )}

          <p className={`flex-1 font-bold text-lg leading-snug ${!fixture.is_home_game ? 'text-gray-900' : 'text-gray-400'
            }`}>
            {fixture.away_team_name}
          </p>
        </div>

        {/* Venue + badge */}
        <div className="w-full md:w-44 flex-shrink-0 flex md:flex-col items-center md:items-end gap-3 md:gap-1">
          <p className="text-gray-500 text-xs">{fixture.venue || '—'}</p>
          <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-wider ${fixture.is_home_game
              ? 'bg-gfc-lime text-gfc-900'
              : 'border border-gfc-500 text-gray-400'
            }`}>
            {fixture.is_home_game ? 'Home' : 'Away'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ */
export default function Fixtures() {
  const { teamType } = useParams()
  const { pathname } = useLocation()
  const isResults = pathname.endsWith('/results')

  // Team is optional — used only for the page header.
  // If this fails, fixtures still display (partial failure is fine).
  const { data: team, isError: teamError, refetch: retryTeam } = useQuery({
    queryKey: ['team', teamType],
    queryFn: () => getTeamBySlug(teamType),
  })

  const {
    data: fixtures,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fixtures', teamType, isResults],
    queryFn: () => getFixtures(teamType, isResults),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <div className="bg-gfc-900 pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 w-28 bg-gfc-700/50 animate-pulse rounded mb-5" />
          <div className="h-14 w-48 bg-gfc-800 animate-pulse rounded" />
        </div>
      </div>
      <div className="h-1 bg-gfc-lime" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FixtureSkeleton count={5} />
      </div>
    </div>
  )

  if (isError) return (
    <ErrorMessage
      type={error?.response?.status ? 'server' : 'network'}
      message={error?.message}
      onRetry={refetch}
      context="fixtures"
    />
  )

  const grouped = fixtures?.reduce((acc, f) => {
    const month = new Date(f.date).toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric',
    })
    if (!acc[month]) acc[month] = []
    acc[month].push(f)
    return acc
  }, {}) ?? {}

  return (
    <div>
      <SEO
        title={`${team?.name ?? 'Team'} ${isResults ? 'Results' : 'Fixtures'}`}
        description={`${isResults ? 'Latest results' : 'Upcoming fixtures'} for ${team?.programme_name ?? 'Hillyfielders Gorkha FC'} ${team?.name ?? ''}.`}
      />
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">{team ? `${team.programme_name} — ${team.name}` : 'Hillyfielders Gorkha FC'}</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            {isResults ? 'Results' : 'Fixtures'}
          </h1>
        </div>
      </section>

      <TeamPageTabs teamType={teamType} />

      {/* Lime divider */}
      <div className="h-1 bg-gfc-lime" />

      {/* Content (white) */}
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Partial failure — team header failed but fixtures loaded fine */}
          {teamError && (
            <div className="mb-6">
              <InlineError
                message="Could not load team info."
                onRetry={retryTeam}
              />
            </div>
          )}

          {!fixtures?.length ? (
            <ErrorMessage type="empty" context="fixtures" />
          ) : (
            Object.entries(grouped).map(([month, monthFixtures]) => (
              <div key={month} className="mb-12">
                <div className="mb-5 pb-3 border-b-2 border-gfc-lime">
                  <h2 className="text-gray-900 font-black uppercase text-2xl">{month}</h2>
                </div>
                <div className="border border-gray-200">
                  {monthFixtures.map(f => <FixtureRow key={f.id} fixture={f} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
