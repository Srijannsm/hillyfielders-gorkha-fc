import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminTeams, createTeam, updateTeam, deleteTeam,
  getAdminProgrammes, createProgramme, updateProgramme, deleteProgramme,
} from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

function TeamForm({ initial = {}, programmes = [], onSave, onClose }) {
  const [f, setF] = useState({
    name: initial.name ?? '',
    programme: initial.programme ?? '',
    order: initial.order ?? 0,
    description: initial.description ?? '',
    is_active: initial.is_active ?? true,
  })
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
        <label className="block text-xs font-medium text-gray-600 mb-1">Team Name *</label>
        <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className="input" placeholder="e.g. Senior Team" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Programme *</label>
        <select required value={f.programme} onChange={e => setF(p => ({ ...p, programme: e.target.value }))} className="input">
          <option value="">Select programme</option>
          {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
        <input type="number" value={f.order} onChange={e => setF(p => ({ ...p, order: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))}
          className="input resize-none" rows={3} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_active} onChange={e => setF(p => ({ ...p, is_active: e.target.checked }))} />
        <span className="text-sm text-gray-600">Active</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function ProgrammeForm({ initial = {}, onSave, onClose }) {
  const [f, setF] = useState({
    gender: initial.gender ?? 'mens',
    name: initial.name ?? '',
    is_active: initial.is_active ?? true,
  })
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
        <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
        <select required value={f.gender} onChange={e => setF(p => ({ ...p, gender: e.target.value }))} className="input">
          <option value="mens">Men's</option>
          <option value="womens">Women's</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Programme Name *</label>
        <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className="input" placeholder="e.g. Men's Programme" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_active} onChange={e => setF(p => ({ ...p, is_active: e.target.checked }))} />
        <span className="text-sm text-gray-600">Active</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

export default function Teams() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('teams')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const { data: teams = [],      isLoading: loadingT } = useQuery({ queryKey: ['admin-teams'],      queryFn: getAdminTeams      })
  const { data: programmes = [], isLoading: loadingPr } = useQuery({ queryKey: ['admin-programmes'], queryFn: getAdminProgrammes })

  const inv = () => { qc.invalidateQueries(['admin-teams']); qc.invalidateQueries(['admin-programmes']) }

  const createT  = useMutation({ mutationFn: createTeam,       onSuccess: inv })
  const updateT  = useMutation({ mutationFn: ([id, d]) => updateTeam(id, d),       onSuccess: inv })
  const deleteT  = useMutation({ mutationFn: deleteTeam, onSuccess: inv, onError: err => setDeleteError(err.response?.data?.detail ?? 'Delete failed.') })
  const createPr = useMutation({ mutationFn: createProgramme,  onSuccess: inv })
  const updatePr = useMutation({ mutationFn: ([id, d]) => updateProgramme(id, d),  onSuccess: inv })
  const deletePr = useMutation({ mutationFn: deleteProgramme,  onSuccess: inv })

  function handleSaveTeam(data)      { return modal.item ? updateT.mutateAsync([modal.item.id, data])  : createT.mutateAsync(data)  }
  function handleSaveProgramme(data) { return modal.item ? updatePr.mutateAsync([modal.item.id, data]) : createPr.mutateAsync(data) }
  function confirmDelete() {
    if (toDelete.type === 'team') deleteT.mutate(toDelete.item.id)
    else deletePr.mutate(toDelete.item.id)
    setToDelete(null)
  }

  const teamCols = [
    { key: 'name',          label: 'Team' },
    { key: 'programme_name',label: 'Programme' },
    { key: 'slug',          label: 'Slug' },
    { key: 'order',         label: 'Order' },
    { key: 'is_active',     label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {r.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  const progCols = [
    { key: 'name',   label: 'Programme' },
    { key: 'gender', label: 'Gender' },
    { key: 'is_active', label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {r.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['teams', 'programmes'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ type: tab })} className="btn-primary">
          + Add {tab === 'teams' ? 'Team' : 'Programme'}
        </button>
      </div>

      {tab === 'teams' ? (
        <DataTable columns={teamCols} data={teams} loading={loadingT}
          onEdit={item => setModal({ type: 'teams', item })}
          onDelete={item => setToDelete({ type: 'team', item })} />
      ) : (
        <DataTable columns={progCols} data={programmes} loading={loadingPr}
          onEdit={item => setModal({ type: 'programmes', item })}
          onDelete={item => setToDelete({ type: 'programme', item })} />
      )}

      <Modal open={!!modal} title={modal?.item ? 'Edit' : 'Add'} onClose={() => setModal(null)}>
        {modal?.type === 'teams' && (
          <TeamForm initial={modal.item ?? {}} programmes={programmes} onSave={handleSaveTeam} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'programmes' && (
          <ProgrammeForm initial={modal.item ?? {}} onSave={handleSaveProgramme} onClose={() => setModal(null)} />
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete}
        message={`Delete "${toDelete?.item?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />

      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded shadow-lg max-w-sm z-50">
          <p className="text-sm">{deleteError}</p>
          <button className="text-xs underline mt-1" onClick={() => setDeleteError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  )
}
