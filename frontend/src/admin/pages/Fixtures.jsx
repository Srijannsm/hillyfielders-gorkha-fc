import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminFixtures, createFixture, updateFixture, deleteFixture,
  getAdminCompetitions, createCompetition, updateCompetition, deleteCompetition,
  getAdminTeams,
} from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

function FixtureForm({ initial = {}, teams = [], competitions = [], onSave, onClose }) {
  // our_name  = display name for us   (e.g. "HillyFielders Gorkha FC")
  // opponent  = display name for them (e.g. "Pokhara FC")
  // our_score / opp_score are always from our perspective.
  // On submit we map to home_team_name/away_team_name/home_score/away_score via is_home_game.
  const isHome = initial.is_home_game ?? true
  const [f, setF] = useState({
    our_team:     initial.our_team    ?? '',
    our_name:     isHome ? (initial.home_team_name ?? 'HillyFielders Gorkha FC') : (initial.away_team_name ?? 'HillyFielders Gorkha FC'),
    opponent:     isHome ? (initial.away_team_name ?? '') : (initial.home_team_name ?? ''),
    competition:  initial.competition ?? '',
    date:         initial.date ? initial.date.slice(0, 16) : '',
    venue:        initial.venue ?? '',
    is_home_game: isHome,
    our_score:    (isHome ? initial.home_score : initial.away_score) ?? '',
    opp_score:    (isHome ? initial.away_score : initial.home_score) ?? '',
    is_completed: initial.is_completed ?? false,
  })
  const [saving, setSaving] = useState(false)

  // One-click fix for records where names/scores were entered the wrong way round
  function swap() {
    setF(p => ({
      ...p,
      our_name:  p.opponent,
      opponent:  p.our_name,
      our_score: p.opp_score,
      opp_score: p.our_score,
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      our_team:       f.our_team,
      competition:    f.competition || null,
      date:           f.date,
      venue:          f.venue,
      is_home_game:   f.is_home_game,
      is_completed:   f.is_completed,
      home_team_name: f.is_home_game ? f.our_name  : f.opponent,
      away_team_name: f.is_home_game ? f.opponent  : f.our_name,
      home_score:     f.is_home_game
        ? (f.our_score !== '' ? Number(f.our_score) : null)
        : (f.opp_score !== '' ? Number(f.opp_score) : null),
      away_score:     f.is_home_game
        ? (f.opp_score !== '' ? Number(f.opp_score) : null)
        : (f.our_score !== '' ? Number(f.our_score) : null),
    }
    await onSave(payload)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Our Team *</label>
          <select required value={f.our_team} onChange={e => setF(p => ({ ...p, our_team: e.target.value }))} className="input">
            <option value="">Select team</option>
            {['mens', 'womens'].map(gender => {
              const genderTeams = teams.filter(t => t.programme_gender === gender)
              if (!genderTeams.length) return null
              return (
                <optgroup key={gender} label={gender === 'mens' ? "Men's" : "Women's"}>
                  {genderTeams.map(t => <option key={t.id} value={t.id}>{t.programme_gender=== 'mens' ? "Men's" : "Women's"}-{t.name}</option>)}
                </optgroup>
              )
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Our Club Name *</label>
          <input required value={f.our_name} onChange={e => setF(p => ({ ...p, our_name: e.target.value }))}
            className="input" placeholder="HillyFielders Gorkha FC" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Opponent *</label>
          <input required value={f.opponent} onChange={e => setF(p => ({ ...p, opponent: e.target.value }))}
            className="input" placeholder="e.g. Pokhara FC" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time *</label>
          <input required type="datetime-local" value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
          <input value={f.venue} onChange={e => setF(p => ({ ...p, venue: e.target.value }))} className="input" placeholder="Stadium name" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Competition</label>
          <select value={f.competition} onChange={e => setF(p => ({ ...p, competition: e.target.value }))} className="input">
            <option value="">None</option>
            {competitions.map(c => <option key={c.id} value={c.id}>{c.name} ({c.season})</option>)}
          </select>
        </div>
      </div>

      {/* Score — always Our Club vs Opponent, never ambiguous */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</p>
          <button type="button" onClick={swap}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium"
            title="Swap if names or scores look reversed">
            ⇄ Swap teams
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 truncate">{f.our_name || 'Us'}</label>
            <input type="number" min="0" value={f.our_score}
              onChange={e => setF(p => ({ ...p, our_score: e.target.value }))}
              className="input text-center text-lg font-bold" placeholder="—" />
          </div>
          <span className="text-gray-400 font-bold text-lg mt-4">vs</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 truncate">{f.opponent || 'Opponent'}</label>
            <input type="number" min="0" value={f.opp_score}
              onChange={e => setF(p => ({ ...p, opp_score: e.target.value }))}
              className="input text-center text-lg font-bold" placeholder="—" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.is_home_game} onChange={e => setF(p => ({ ...p, is_home_game: e.target.checked }))} />
          <span className="text-sm text-gray-600">Home Game</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.is_completed} onChange={e => setF(p => ({ ...p, is_completed: e.target.checked }))} />
          <span className="text-sm text-gray-600">Completed</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function CompetitionForm({ initial = {}, onSave, onClose }) {
  const [f, setF] = useState({ name: initial.name ?? '', season: initial.season ?? '' })
  const [saving, setSaving] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(f)
    setSaving(false)
    onClose()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Competition Name *</label>
        <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Season *</label>
        <input required value={f.season} onChange={e => setF(p => ({ ...p, season: e.target.value }))} className="input" placeholder="e.g. 2024-25" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

const RESULT_BADGE = { W: 'bg-green-50 text-green-600', L: 'bg-red-50 text-red-500', D: 'bg-gray-100 text-gray-500' }

export default function Fixtures() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('fixtures')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const { data: fixtures     = [], isLoading: loadingF } = useQuery({ queryKey: ['admin-fixtures'],     queryFn: getAdminFixtures     })
  const { data: competitions = [], isLoading: loadingC } = useQuery({ queryKey: ['admin-competitions'], queryFn: getAdminCompetitions })
  const { data: teams        = [] }                       = useQuery({ queryKey: ['admin-teams'],        queryFn: getAdminTeams        })

  const inv = () => { qc.invalidateQueries(['admin-fixtures']); qc.invalidateQueries(['admin-competitions']) }

  const createF  = useMutation({ mutationFn: createFixture,     onSuccess: inv })
  const updateF  = useMutation({ mutationFn: ([id, d]) => updateFixture(id, d),     onSuccess: inv })
  const deleteF  = useMutation({ mutationFn: deleteFixture,     onSuccess: inv })
  const createC  = useMutation({ mutationFn: createCompetition, onSuccess: inv })
  const updateC  = useMutation({ mutationFn: ([id, d]) => updateCompetition(id, d), onSuccess: inv })
  const deleteC  = useMutation({ mutationFn: deleteCompetition, onSuccess: inv })

  function handleSaveFixture(data)     { return modal.item ? updateF.mutateAsync([modal.item.id, data]) : createF.mutateAsync(data) }
  function handleSaveCompetition(data) { return modal.item ? updateC.mutateAsync([modal.item.id, data]) : createC.mutateAsync(data) }
  function confirmDelete() {
    if (toDelete.type === 'fixture') deleteF.mutate(toDelete.item.id)
    else deleteC.mutate(toDelete.item.id)
    setToDelete(null)
  }

  const fixtureCols = [
    { key: 'match', label: 'Match', render: r => `${r.home_team_name} vs ${r.away_team_name}` },
    { key: 'team_name', label: 'Team', render: r => {
      const t = teams.find(t => t.id === r.our_team)
      const gender = t?.programme_gender === 'mens' ? "Men's" : t?.programme_gender === 'womens' ? "Women's" : null
      return (
        <span>
          {r.team_name}
          {gender && <span className="ml-1.5 text-[10px] text-gray-400 font-medium">{gender}</span>}
        </span>
      )
    }},
    { key: 'competition_name', label: 'Competition' },
    { key: 'date',             label: 'Date', render: r => new Date(r.date).toLocaleDateString() },
    { key: 'result',           label: 'Result', render: r => r.result
      ? <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${RESULT_BADGE[r.result]}`}>{r.result}</span>
      : <span className="text-xs text-gray-400">—</span>
    },
    { key: 'is_completed', label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_completed ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-500'}`}>
        {r.is_completed ? 'Played' : 'Upcoming'}
      </span>
    )},
  ]

  const compCols = [
    { key: 'name',   label: 'Competition' },
    { key: 'season', label: 'Season' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['fixtures', 'competitions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ type: tab })} className="btn-primary">
          + Add {tab === 'fixtures' ? 'Fixture' : 'Competition'}
        </button>
      </div>

      {tab === 'fixtures' ? (
        <DataTable columns={fixtureCols} data={fixtures} loading={loadingF}
          onEdit={item => setModal({ type: 'fixtures', item })}
          onDelete={item => setToDelete({ type: 'fixture', item })} />
      ) : (
        <DataTable columns={compCols} data={competitions} loading={loadingC}
          onEdit={item => setModal({ type: 'competitions', item })}
          onDelete={item => setToDelete({ type: 'competition', item })} />
      )}

      <Modal open={!!modal} title={modal?.item ? 'Edit' : 'Add'} onClose={() => setModal(null)} wide>
        {modal?.type === 'fixtures' && (
          <FixtureForm initial={modal.item ?? {}} teams={teams} competitions={competitions}
            onSave={handleSaveFixture} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'competitions' && (
          <CompetitionForm initial={modal.item ?? {}} onSave={handleSaveCompetition} onClose={() => setModal(null)} />
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete}
        message={`Delete this ${toDelete?.type}? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
