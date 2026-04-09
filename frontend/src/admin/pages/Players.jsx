import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminPlayers, createPlayer, updatePlayer, deletePlayer,
  getAdminStaff, createStaff, updateStaff, deleteStaff,
  getAdminTeams,
} from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']
const ROLES = ['head_coach', 'assistant_coach', 'goalkeeper_coach', 'physio', 'manager']

function buildFormData(fields, imageKey, imageFile) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, v)
  })
  if (imageFile) fd.append(imageKey, imageFile)
  return fd
}

// ─── Player Form ──────────────────────────────────────────────────────────────
function PlayerForm({ initial = {}, teams = [], onSave, onClose }) {
  const [f, setF] = useState({
    name: initial.name ?? '',
    position: initial.position ?? 'GK',
    jersey_number: initial.jersey_number ?? '',
    nationality: initial.nationality ?? 'Nepali',
    team: initial.team ?? '',
    bio: initial.bio ?? '',
    is_active: initial.is_active ?? true,
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const fd = buildFormData(f, 'photo', photo)
    await onSave(fd)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageUpload label="Photo" currentUrl={initial.photo} onChange={setPhoto} />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))}
            className="input" placeholder="Player name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Position *</label>
          <select required value={f.position} onChange={e => setF(p => ({ ...p, position: e.target.value }))} className="input">
            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Jersey No. *</label>
          <input required type="number" value={f.jersey_number} onChange={e => setF(p => ({ ...p, jersey_number: e.target.value }))}
            className="input" placeholder="7" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
          <input value={f.nationality} onChange={e => setF(p => ({ ...p, nationality: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Team *</label>
          <select required value={f.team} onChange={e => setF(p => ({ ...p, team: e.target.value }))} className="input">
            <option value="">Select team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
          <textarea value={f.bio} onChange={e => setF(p => ({ ...p, bio: e.target.value }))}
            className="input resize-none" rows={3} />
        </div>
        <label className="col-span-2 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.is_active} onChange={e => setF(p => ({ ...p, is_active: e.target.checked }))} />
          <span className="text-sm text-gray-600">Active</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

// ─── Staff Form ───────────────────────────────────────────────────────────────
function StaffForm({ initial = {}, teams = [], onSave, onClose }) {
  const [f, setF] = useState({
    name: initial.name ?? '',
    role: initial.role ?? 'head_coach',
    team: initial.team ?? '',
    bio: initial.bio ?? '',
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const fd = buildFormData(f, 'photo', photo)
    await onSave(fd)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageUpload label="Photo" currentUrl={initial.photo} onChange={setPhoto} />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
          <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
          <select required value={f.role} onChange={e => setF(p => ({ ...p, role: e.target.value }))} className="input">
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Team *</label>
          <select required value={f.team} onChange={e => setF(p => ({ ...p, team: e.target.value }))} className="input">
            <option value="">Select team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
          <textarea value={f.bio} onChange={e => setF(p => ({ ...p, bio: e.target.value }))}
            className="input resize-none" rows={3} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Players() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('players')
  const [teamFilter, setTeamFilter] = useState('all')
  const [modal, setModal] = useState(null)   // null | { type, item? }
  const [toDelete, setToDelete] = useState(null)

  const { data: players = [], isLoading: loadingP } = useQuery({ queryKey: ['admin-players'], queryFn: getAdminPlayers })
  const { data: staff   = [], isLoading: loadingS } = useQuery({ queryKey: ['admin-staff'],   queryFn: getAdminStaff   })
  const { data: teams   = [] }                       = useQuery({ queryKey: ['admin-teams'],   queryFn: getAdminTeams   })

  const filteredPlayers = teamFilter === 'all' ? players : players.filter(p => p.team === Number(teamFilter))
  const filteredStaff   = teamFilter === 'all' ? staff   : staff.filter(s => s.team === Number(teamFilter))

  const invalidate = () => {
    qc.invalidateQueries(['admin-players'])
    qc.invalidateQueries(['admin-staff'])
  }

  const createP  = useMutation({ mutationFn: createPlayer,  onSuccess: invalidate })
  const updateP  = useMutation({ mutationFn: ([id, d]) => updatePlayer(id, d), onSuccess: invalidate })
  const deleteP  = useMutation({ mutationFn: deletePlayer,  onSuccess: invalidate })
  const createS  = useMutation({ mutationFn: createStaff,   onSuccess: invalidate })
  const updateS  = useMutation({ mutationFn: ([id, d]) => updateStaff(id, d), onSuccess: invalidate })
  const deleteS  = useMutation({ mutationFn: deleteStaff,   onSuccess: invalidate })

  function handleSavePlayer(fd) {
    if (modal.item) return updateP.mutateAsync([modal.item.id, fd])
    return createP.mutateAsync(fd)
  }
  function handleSaveStaff(fd) {
    if (modal.item) return updateS.mutateAsync([modal.item.id, fd])
    return createS.mutateAsync(fd)
  }
  function confirmDelete() {
    if (toDelete.type === 'player') deleteP.mutate(toDelete.item.id)
    else deleteS.mutate(toDelete.item.id)
    setToDelete(null)
  }

  const playerCols = [
    { key: 'photo',    label: 'Photo',    render: r => r.photo ? <img src={r.photo} className="h-8 w-8 rounded-full object-cover" /> : '—' },
    { key: 'name',     label: 'Name' },
    { key: 'position', label: 'Position' },
    { key: 'jersey_number', label: '#' },
    { key: 'team_name', label: 'Team' },
    { key: 'is_active', label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {r.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  const staffCols = [
    { key: 'photo', label: 'Photo', render: r => r.photo ? <img src={r.photo} className="h-8 w-8 rounded-full object-cover" /> : '—' },
    { key: 'name',         label: 'Name' },
    { key: 'role_display', label: 'Role' },
    { key: 'team_name',    label: 'Team' },
  ]

  return (
    <div className="space-y-5">
      {/* Tabs + filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
          {['players', 'staff'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="input py-1.5 w-48 text-sm"
          >
            <option value="all">All Teams</option>
            {['mens', 'womens'].map(gender => {
              const genderTeams = teams.filter(t => t.programme_gender === gender)
              if (!genderTeams.length) return null
              return (
                <optgroup key={gender} label={gender === 'mens' ? "Men's" : "Women's"}>
                  {genderTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.programme_gender === 'mens' ? "Men's" : "Women's"}-{t.name}</option>
                  ))}
                </optgroup>
              )
            })}
          </select>
          <button onClick={() => setModal({ type: tab })} className="btn-primary whitespace-nowrap">
            + Add {tab === 'players' ? 'Player' : 'Staff'}
          </button>
        </div>
      </div>

      {tab === 'players' ? (
        <DataTable
          columns={playerCols}
          data={filteredPlayers}
          loading={loadingP}
          onEdit={item => setModal({ type: 'players', item })}
          onDelete={item => setToDelete({ type: 'player', item })}
        />
      ) : (
        <DataTable
          columns={staffCols}
          data={filteredStaff}
          loading={loadingS}
          onEdit={item => setModal({ type: 'staff', item })}
          onDelete={item => setToDelete({ type: 'staff', item })}
        />
      )}

      <Modal
        open={!!modal}
        title={modal?.item ? `Edit ${modal?.type === 'players' ? 'Player' : 'Staff'}` : `Add ${modal?.type === 'players' ? 'Player' : 'Staff'}`}
        onClose={() => setModal(null)}
      >
        {modal?.type === 'players' && (
          <PlayerForm initial={modal.item ?? {}} teams={teams} onSave={handleSavePlayer} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'staff' && (
          <StaffForm initial={modal.item ?? {}} teams={teams} onSave={handleSaveStaff} onClose={() => setModal(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete "${toDelete?.item?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
