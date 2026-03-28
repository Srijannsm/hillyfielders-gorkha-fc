import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getFixtures } from '../services/api'

function FixtureRow({ fixture }) {
  const isCompleted = fixture.is_completed
  const result = fixture.result

  const resultColor = {
    W: 'bg-green-100 text-green-700',
    L: 'bg-red-100 text-red-700',
    D: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between flex-wrap gap-4">

        {/* Competition + date */}
        <div className="text-left w-36 flex-shrink-0">
          <p className="text-[#1B4332] text-xs font-semibold uppercase tracking-wide">
            {fixture.competition_name || 'Friendly'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(fixture.date).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <p className="text-gray-400 text-xs">
            {new Date(fixture.date).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Teams + score */}
        <div className="flex-1 flex items-center justify-center gap-4 min-w-0">
          <p className={`font-bold text-right flex-1 truncate ${
            fixture.is_home_game ? 'text-[#1B4332]' : 'text-gray-700'
          }`}>
            {fixture.home_team_name}
          </p>

          {isCompleted ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-[#1B4332] text-white font-black text-lg px-4 py-1 rounded-lg min-w-16 text-center">
                {fixture.home_score} – {fixture.away_score}
              </span>
              {result && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${resultColor[result]}`}>
                  {result}
                </span>
              )}
            </div>
          ) : (
            <span className="bg-[#BEFF00] text-[#1B4332] font-black text-sm px-4 py-2 rounded-lg flex-shrink-0">
              VS
            </span>
          )}

          <p className={`font-bold text-left flex-1 truncate ${
            !fixture.is_home_game ? 'text-[#1B4332]' : 'text-gray-700'
          }`}>
            {fixture.away_team_name}
          </p>
        </div>

        {/* Venue */}
        <div className="text-right w-36 flex-shrink-0">
          <p className="text-gray-400 text-xs">
            {fixture.venue || '—'}
          </p>
          <span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${
            fixture.is_home_game
              ? 'bg-[#1B4332] text-[#BEFF00]'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {fixture.is_home_game ? 'Home' : 'Away'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Fixtures() {
  const { teamType, mode } = useParams()
  const isResults = mode === 'results'
  const isMens = teamType === 'mens'

  const { data: fixtures, isLoading, isError } = useQuery({
    queryKey: ['fixtures', teamType, isResults],
    queryFn: () => getFixtures(teamType, isResults),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#1B4332] font-bold animate-pulse">Loading...</p>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Failed to load. Is Django running?</p>
    </div>
  )

  const grouped = fixtures?.reduce((acc, f) => {
    const month = new Date(f.date).toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric'
    })
    if (!acc[month]) acc[month] = []
    acc[month].push(f)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <section className="bg-[#1B4332] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#BEFF00] text-sm font-semibold uppercase tracking-widest mb-2">
            {isMens ? "Men's First Team" : "Women's First Team"}
          </p>
          <h1 className="text-5xl font-black">
            {isResults ? 'Results' : 'Fixtures'}
          </h1>
        </div>
      </section>

      {/* Toggle fixtures / results */}
      <div className="bg-[#2D6A4F] px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-4">
          
           <a href={`/${teamType}/fixtures`}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              !isResults
                ? 'bg-[#BEFF00] text-[#1B4332]'
                : 'text-white hover:text-[#BEFF00]'
            }`}
          >
            Upcoming
          </a>
          
           <a href={`/${teamType}/results`}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              isResults
                ? 'bg-[#BEFF00] text-[#1B4332]'
                : 'text-white hover:text-[#BEFF00]'
            }`}
          >
            Results
          </a>
        </div>
      </div>

      {/* Fixtures list */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {!fixtures?.length ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📅</p>
            <p className="font-semibold">
              No {isResults ? 'results' : 'fixtures'} yet.
            </p>
            <p className="text-sm mt-1">Add them in the Django admin.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, monthFixtures]) => (
            <div key={month} className="mb-10">
              <h2 className="text-[#1B4332] font-black text-xl mb-4 border-b-2 border-[#BEFF00] pb-2 inline-block">
                {month}
              </h2>
              <div className="flex flex-col gap-3">
                {monthFixtures.map(f => (
                  <FixtureRow key={f.id} fixture={f} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}