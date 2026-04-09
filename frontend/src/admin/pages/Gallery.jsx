import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminPhotos, createPhoto, updatePhoto, deletePhoto } from '../services/adminApi'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'

const CATEGORIES = [
  { value: 'training',  label: 'Training' },
  { value: 'matchday',  label: 'Match Day' },
  { value: 'academy',   label: 'Academy' },
  { value: 'team',      label: 'Team Photo' },
]

function PhotoForm({ initial = {}, onSave, onClose }) {
  const [f, setF] = useState({
    title:        initial.title        ?? '',
    category:     initial.category     ?? 'training',
    caption:      initial.caption      ?? '',
    date_taken:   initial.date_taken   ?? '',
    is_published: initial.is_published ?? true,
  })
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, v))
    if (image) fd.append('image', image)
    await onSave(fd)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageUpload label="Photo *" currentUrl={initial.image} onChange={setImage} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
        <input required value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
          <select required value={f.category} onChange={e => setF(p => ({ ...p, category: e.target.value }))} className="input">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date Taken</label>
          <input type="date" value={f.date_taken} onChange={e => setF(p => ({ ...p, date_taken: e.target.value }))} className="input" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Caption</label>
        <textarea value={f.caption} onChange={e => setF(p => ({ ...p, caption: e.target.value }))}
          className="input resize-none" rows={2} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_published} onChange={e => setF(p => ({ ...p, is_published: e.target.checked }))} />
        <span className="text-sm text-gray-600">Publish</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

export default function Gallery() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [filter, setFilter] = useState('all')

  const { data: photos = [], isLoading } = useQuery({ queryKey: ['admin-photos'], queryFn: getAdminPhotos })

  const inv = () => qc.invalidateQueries(['admin-photos'])
  const createP = useMutation({ mutationFn: createPhoto, onSuccess: inv })
  const updateP = useMutation({ mutationFn: ([id, d]) => updatePhoto(id, d), onSuccess: inv })
  const deleteP = useMutation({ mutationFn: deletePhoto, onSuccess: inv })

  function handleSave(fd) { return modal.item ? updateP.mutateAsync([modal.item.id, fd]) : createP.mutateAsync(fd) }

  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Category filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {['all', ...CATEGORIES.map(c => c.value)].map(v => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filter === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'all' ? 'All' : CATEGORIES.find(c => c.value === v)?.label}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ item: null })} className="btn-primary">+ Upload Photo</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No photos found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(photo => (
            <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img src={photo.image} alt={photo.title} className="h-full w-full object-cover" />
              {!photo.is_published && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Hidden
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium text-center px-2 line-clamp-2">{photo.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ item: photo })}
                    className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => setToDelete(photo)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} title={modal?.item ? 'Edit Photo' : 'Upload Photo'} onClose={() => setModal(null)}>
        {modal && <PhotoForm initial={modal.item ?? {}} onSave={handleSave} onClose={() => setModal(null)} />}
      </Modal>

      <ConfirmDialog open={!!toDelete}
        message={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={() => { deleteP.mutate(toDelete.id); setToDelete(null) }}
        onCancel={() => setToDelete(null)} />
    </div>
  )
}
