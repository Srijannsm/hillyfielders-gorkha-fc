import { useQuery } from '@tanstack/react-query'
import { useParams, useLocation } from 'react-router-dom'
import { getFixtures } from '../services/api'
import TeamPageTabs from '../components/TeamPageTabs'
import SEO from '../components/SEO'

const TEAM_LABELS = {
  'mens-senior':   "Men's Senior Team",
  'mens-u16':      "Men's U-16",
  'mens-u14':      "Men's U-14",
  'mens-u12':      "Men's U-12",
  'womens-senior': "Women's Senior Team",
  'womens-u16':    "Women's U-16",
  'womens-u14':    "Women's U-14",
  'womens-u12':    "Women's U-12",
  'mens':          "Men's First Team",
  'womens':        "Women's First Team",
}

const RESULT_STYLE = {
  W: { bg: 'bg-green-500',  text: 'text-white', label: 'W' },
  L: { bg: 'bg-red-600',    text: 'text-white', label: 'L' },
  D: { bg: 'bg-gray-500',   text: 'text-white', label: 'D' },
}

/* ── Fixture row ───────────────────────────────────────── */
function FixtureRow({ fixture }) {
  const result = RESULT_STYLE[fixture.result]

  return (
    <div className="group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors px-6 py-5">
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
          <p className={`flex-1 text-right font-bold text-sm leading-snug ${
            fixture.is_home_game ? 'text-gray-900' : 'text-gray-400'
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
            <span className="bg-gfc-lime text-gfc-900 font-black text-xs px-4 py-2 uppercase tracking-widest flex-shrink-0">
              VS
            </span>
          )}

          <p className={`flex-1 font-bold text-sm leading-snug ${
            !fixture.is_home_game ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {fixture.away_team_name}
          </p>
        </div>

        {/* Venue + badge */}
        <div className="w-full md:w-44 flex-shrink-0 flex md:flex-col items-center md:items-end gap-3 md:gap-1">
          <p className="text-gray-500 text-xs">{fixture.venue || '—'}</p>
          <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-wider ${
            fixture.is_home_game
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
  const teamLabel = TEAM_LABELS[teamType] ?? teamType

  const { data: fixtures, isLoading, isError } = useQuery({
    queryKey: ['fixtures', teamType, isResults],
    queryFn: () => getFixtures(teamType, isResults),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gfc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gfc-lime font-black text-3xl animate-pulse mb-2">GFC</div>
        <p className="text-gray-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-400">Failed to load. Is Django running?</p>
    </div>
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
        title="Fixtures & Results"
        description="Upcoming fixtures and latest results for Hillyfielders Gorkha FC teams."
      />
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">{teamLabel}</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            {isResults ? 'Results' : 'Fixtures'}
          </h1>
        </div>
      </section>

      <TeamPageTabs teamType={teamType} />

      {/* Content (white) */}
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {!fixtures?.length ? (
            <div className="text-center py-24 border border-gray-100 bg-gray-50">
              <p className="text-gfc-700/20 font-black text-5xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
              <p className="text-gray-900 font-black uppercase text-xl mb-2">
                No {isResults ? 'Results' : 'Fixtures'} Yet
              </p>
              <p className="text-gray-400 text-sm">Add them in the Django admin.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([month, monthFixtures]) => (
              <div key={month} className="mb-12">
                <div className="flex items-center gap-5 mb-5">
                  <h2 className="text-gray-900 font-black uppercase text-lg">{month}</h2>
                  <div className="flex-1 h-px bg-gray-200" />
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
