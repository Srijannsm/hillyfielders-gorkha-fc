import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getTeams } from '../services/api'

function PlayerCard({ player }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow group">
      {/* Photo */}
      <div className="bg-[#1B4332] h-56 flex items-center justify-center overflow-hidden">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#BEFF00] text-5xl font-black">
              {player.jersey_number}
            </span>
            <span className="text-white text-sm opacity-60">No photo</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-800 text-lg leading-tight">
              {player.name}
            </p>
            <p className="text-[#1B4332] text-sm font-semibold mt-1">
              {player.position_display}
            </p>
          </div>
          <span className="text-3xl font-black text-gray-200">
            {player.jersey_number}
          </span>
        </div>
        {player.nationality && (
          <p className="text-gray-400 text-xs mt-2">{player.nationality}</p>
        )}
      </div>
    </div>
  )
}

function StaffCard({ member }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow flex items-center gap-4 p-4">
      <div className="bg-[#1B4332] w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#BEFF00] text-xl font-black">
            {member.name.charAt(0)}
          </span>
        )}
      </div>
      <div>
        <p className="font-bold text-gray-800">{member.name}</p>
        <p className="text-[#1B4332] text-sm font-semibold">{member.role_display}</p>
      </div>
    </div>
  )
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD']
const POSITION_LABELS = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
}

export default function Squad() {
  const { teamType } = useParams()
  const isMens = teamType === 'mens'

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-[#1B4332] font-bold text-xl animate-pulse">
        Loading squad...
      </div>
    </div>
  )

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Failed to load squad. Is Django running?</p>
    </div>
  )

  const team = teams?.find(t => t.team_type === teamType)

  if (!team) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">
        No {isMens ? "men's" : "women's"} team found. Add one in the admin.
      </p>
    </div>
  )

  // Group players by position
  const grouped = POSITION_ORDER.reduce((acc, pos) => {
    const inPosition = team.players.filter(p => p.position === pos)
    if (inPosition.length) acc[pos] = inPosition
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
          <h1 className="text-5xl font-black mb-2">The Squad</h1>
          <p className="text-gray-300">
            {team.players.length} players · Season 2025/26
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Staff section */}
        {team.staff.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[#1B4332] font-black text-2xl mb-6">
              Coaching Staff
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.staff.map(s => <StaffCard key={s.id} member={s} />)}
            </div>
          </div>
        )}

        {/* Players grouped by position */}
        {Object.entries(grouped).map(([pos, players]) => (
          <div key={pos} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[#1B4332] font-black text-2xl">
                {POSITION_LABELS[pos]}
              </h2>
              <span className="bg-[#BEFF00] text-[#1B4332] text-xs font-bold px-2 py-1 rounded-full">
                {players.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {players.map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </div>
        ))}

        {team.players.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">⚽</p>
            <p className="font-semibold">No players added yet.</p>
            <p className="text-sm mt-1">Add players in the Django admin.</p>
          </div>
        )}
      </div>
    </div>
  )
}