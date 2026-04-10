import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminSponsors, createSponsor, updateSponsor, deleteSponsor } from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'
import { Search, X } from 'lucide-react'

const TIERS = ['platinum', 'gold', 'silver']
const TIER_BADGE = {
  platinum: 'bg-purple-50 text-purple-600',
  gold:     'bg-yellow-50 text-yellow-600',
  silver:   'bg-gray-100 text-gray-500',
}

function SponsorForm({ initial = {}, onSave, onClose }) {
  const [f, setF] = useState({
    name:      initial.name      ?? '',
    website:   initial.website   ?? '',
    tier:      initial.tier      ?? 'silver',
    is_active: initial.is_active ?? true,
  })
  const [logo, setLogo] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, v))
    if (logo) fd.append('logo', logo)
    await onSave(fd)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageUpload label="Logo" currentUrl={initial.logo} onChange={setLogo} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Sponsor Name *</label>
        <input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
        <input type="url" value={f.website} onChange={e => setF(p => ({ ...p, website: e.target.value }))} className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tier *</label>
        <select value={f.tier} onChange={e => setF(p => ({ ...p, tier: e.target.value }))} className="input">
          {TIERS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
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

export default function Sponsors() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  const { data: sponsors = [], isLoading } = useQuery({ queryKey: ['admin-sponsors'], queryFn: getAdminSponsors })

  const inv = () => qc.invalidateQueries(['admin-sponsors'])
  const createS = useMutation({ mutationFn: createSponsor, onSuccess: inv })
  const updateS = useMutation({ mutationFn: ([id, d]) => updateSponsor(id, d), onSuccess: inv })
  const deleteS = useMutation({ mutationFn: deleteSponsor, onSuccess: inv })

  function handleSave(fd) { return modal.item ? updateS.mutateAsync([modal.item.id, fd]) : createS.mutateAsync(fd) }

  const filteredSponsors = useMemo(() => {
    let data = sponsors
    if (tierFilter !== 'all') data = data.filter(s => s.tier === tierFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(s => s.name?.toLowerCase().includes(q))
    }
    return data
  }, [sponsors, tierFilter, search])

  const hasFilters = tierFilter !== 'all' || search.trim()

  const columns = [
    { key: 'logo', label: 'Logo', render: r => r.logo
      ? <img src={r.logo} alt={r.name} className="h-8 w-16 object-contain" /> : '—' },
    { key: 'name',    label: 'Name' },
    { key: 'tier',    label: 'Tier', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_BADGE[r.tier]}`}>{r.tier}</span>
    )},
    { key: 'website', label: 'Website', render: r => r.website
      ? <a href={r.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs truncate max-w-[150px] block">{r.website}</a>
      : '—'
    },
    { key: 'is_active', label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {r.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative" style={{ width: '176px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search sponsors…"
            className="input"
            style={{ paddingLeft: '2rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }} />
        </div>
        <div style={{ width: '128px' }}>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
            className="input" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }}>
            <option value="all">All Tiers</option>
            {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setTierFilter('all') }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 whitespace-nowrap">{filteredSponsors.length} of {sponsors.length}</span>
        <button onClick={() => setModal({ item: null })} className="btn-primary ml-auto">+ Add Sponsor</button>
      </div>

      <DataTable columns={columns} data={filteredSponsors} loading={isLoading}
        onEdit={item => setModal({ item })}
        onDelete={item => setToDelete(item)} />

      <Modal open={!!modal} title={modal?.item ? 'Edit Sponsor' : 'Add Sponsor'} onClose={() => setModal(null)}>
        {modal && <SponsorForm initial={modal.item ?? {}} onSave={handleSave} onClose={() => setModal(null)} />}
      </Modal>

      <ConfirmDialog open={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={() => { deleteS.mutate(toDelete.id); setToDelete(null) }}
        onCancel={() => setToDelete(null)} />
    </div>
  )
}
