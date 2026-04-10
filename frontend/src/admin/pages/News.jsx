import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminArticles, createArticle, updateArticle, deleteArticle,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'
import { Search, X } from 'lucide-react'

function ArticleForm({ initial = {}, categories = [], onSave, onClose }) {
  const [f, setF] = useState({
    title:        initial.title        ?? '',
    slug:         initial.slug         ?? '',
    category:     initial.category     ?? '',
    content:      initial.content      ?? '',
    is_published: initial.is_published ?? false,
  })
  const [coverImage, setCoverImage] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, v))
    if (coverImage) fd.append('cover_image', coverImage)
    await onSave(fd)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ImageUpload label="Cover Image" currentUrl={initial.cover_image} onChange={setCoverImage} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
        <input required value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Slug <span className="text-gray-400 font-normal">(auto-generated if blank)</span></label>
        <input value={f.slug} onChange={e => setF(p => ({ ...p, slug: e.target.value }))} className="input" placeholder="auto" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select value={f.category} onChange={e => setF(p => ({ ...p, category: e.target.value }))} className="input">
          <option value="">None</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Content *</label>
        <textarea required value={f.content} onChange={e => setF(p => ({ ...p, content: e.target.value }))}
          className="input resize-y" rows={10} placeholder="Write article content..." />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_published} onChange={e => setF(p => ({ ...p, is_published: e.target.checked }))} />
        <span className="text-sm text-gray-600">Publish immediately</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function CategoryForm({ initial = {}, onSave, onClose }) {
  const [name, setName] = useState(initial.name ?? '')
  const [saving, setSaving] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ name })
    setSaving(false)
    onClose()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category Name *</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. Match Report" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

export default function News() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('articles')
  const [modal, setModal] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: articles   = [], isLoading: loadingA } = useQuery({ queryKey: ['admin-articles'],   queryFn: getAdminArticles   })
  const { data: categories = [], isLoading: loadingC } = useQuery({ queryKey: ['admin-categories'], queryFn: getAdminCategories })

  const inv = () => { qc.invalidateQueries(['admin-articles']); qc.invalidateQueries(['admin-categories']) }

  const createA  = useMutation({ mutationFn: createArticle,  onSuccess: inv })
  const updateA  = useMutation({ mutationFn: ([id, d]) => updateArticle(id, d),  onSuccess: inv })
  const deleteA  = useMutation({ mutationFn: deleteArticle,  onSuccess: inv })
  const createC  = useMutation({ mutationFn: createCategory, onSuccess: inv })
  const updateC  = useMutation({ mutationFn: ([id, d]) => updateCategory(id, d), onSuccess: inv })
  const deleteC  = useMutation({ mutationFn: deleteCategory, onSuccess: inv })

  function handleSaveArticle(fd)   { return modal.item ? updateA.mutateAsync([modal.item.id, fd]) : createA.mutateAsync(fd) }
  function handleSaveCategory(data){ return modal.item ? updateC.mutateAsync([modal.item.id, data]) : createC.mutateAsync(data) }
  function confirmDelete() {
    if (toDelete.type === 'article') deleteA.mutate(toDelete.item.id)
    else deleteC.mutate(toDelete.item.id)
    setToDelete(null)
  }

  const filteredArticles = useMemo(() => {
    let data = articles
    if (categoryFilter !== 'all') data = data.filter(a => String(a.category) === categoryFilter)
    if (statusFilter === 'published') data = data.filter(a => a.is_published)
    if (statusFilter === 'draft')     data = data.filter(a => !a.is_published)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(a => a.title?.toLowerCase().includes(q) || a.category_name?.toLowerCase().includes(q))
    }
    return data
  }, [articles, categoryFilter, statusFilter, search])

  const hasFilters = categoryFilter !== 'all' || statusFilter !== 'all' || search.trim()

  const articleCols = [
    { key: 'cover_image', label: 'Cover', render: r => r.cover_image
      ? <img src={r.cover_image} className="h-8 w-12 rounded object-cover" /> : '—' },
    { key: 'title',         label: 'Title' },
    { key: 'category_name', label: 'Category' },
    { key: 'created_at',    label: 'Date', render: r => new Date(r.created_at).toLocaleDateString() },
    { key: 'is_published',  label: 'Status', render: r => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
        {r.is_published ? 'Published' : 'Draft'}
      </span>
    )},
  ]

  const catCols = [
    { key: 'name', label: 'Category' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
          {['articles', 'categories'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ type: tab })} className="btn-primary flex-shrink-0">
          + Add {tab === 'articles' ? 'Article' : 'Category'}
        </button>
      </div>

      {tab === 'articles' && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" style={{ width: '196px' }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="input"
              style={{ paddingLeft: '2rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }} />
          </div>
          <div style={{ width: '152px' }}>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="input" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ width: '120px' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="input" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
              <X size={12} /> Clear
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{filteredArticles.length} of {articles.length}</span>
        </div>
      )}

      {tab === 'articles' ? (
        <DataTable columns={articleCols} data={filteredArticles} loading={loadingA}
          onEdit={item => setModal({ type: 'articles', item })}
          onDelete={item => setToDelete({ type: 'article', item })} />
      ) : (
        <DataTable columns={catCols} data={categories} loading={loadingC}
          onEdit={item => setModal({ type: 'categories', item })}
          onDelete={item => setToDelete({ type: 'category', item })} />
      )}

      <Modal open={!!modal} title={modal?.item ? 'Edit' : 'Add'} onClose={() => setModal(null)} wide={modal?.type === 'articles'}>
        {modal?.type === 'articles' && (
          <ArticleForm initial={modal.item ?? {}} categories={categories} onSave={handleSaveArticle} onClose={() => setModal(null)} />
        )}
        {modal?.type === 'categories' && (
          <CategoryForm initial={modal.item ?? {}} onSave={handleSaveCategory} onClose={() => setModal(null)} />
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete}
        message={`Delete "${toDelete?.item?.name ?? toDelete?.item?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
