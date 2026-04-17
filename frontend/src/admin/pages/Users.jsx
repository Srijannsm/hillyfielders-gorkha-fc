import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../services/adminApi'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const ROLES = [
  { value: 'media_officer', label: 'Media Officer' },
  { value: 'team_manager',  label: 'Team Manager'  },
  { value: 'secretary',     label: 'Secretary'     },
  { value: 'coach',         label: 'Coach'         },
]

const ROLE_COLORS = {
  media_officer: 'bg-purple-100 text-purple-700',
  team_manager:  'bg-blue-100 text-blue-700',
  secretary:     'bg-amber-100 text-amber-700',
  coach:         'bg-green-100 text-green-700',
}

const emptyForm = { username: '', first_name: '', last_name: '', email: '', role: 'media_officer', password: '', new_password: '', is_active: true }

export default function Users() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] })

  const createMut = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => { invalidate(); closeModal() },
    onError: e => setError(formatError(e)),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateAdminUser(id, data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: e => setError(formatError(e)),
  })

  const deleteMut = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => { invalidate(); setDeleteTarget(null) },
  })

  function openCreate() {
    setForm(emptyForm)
    setError('')
    setModal('create')
  }

  function openEdit(user) {
    setEditing(user)
    setForm({
      username:     user.username,
      first_name:   user.first_name,
      last_name:    user.last_name,
      email:        user.email,
      role:         user.role ?? 'media_officer',
      new_password: '',
      is_active:    user.is_active,
    })
    setError('')
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (modal === 'create') {
      const { new_password: _, ...payload } = form
      createMut.mutate(payload)
    } else {
      const payload = {
        username:     form.username,
        first_name:   form.first_name,
        last_name:    form.last_name,
        email:        form.email,
        role:         form.role,
        is_active:    form.is_active,
        ...(form.new_password ? { new_password: form.new_password } : {}),
      }
      updateMut.mutate({ id: editing.id, data: payload })
    }
  }

  const columns = [
    { key: 'username',   label: 'Username' },
    {
      key: 'name', label: 'Full Name',
      render: u => `${u.first_name} ${u.last_name}`.trim() || '—',
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: u => u.role
        ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
            {ROLES.find(r => r.value === u.role)?.label ?? u.role}
          </span>
        : '—',
    },
    {
      key: 'is_active', label: 'Status',
      render: u => u.is_active
        ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
        : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>,
    },
  ]

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} staff user{users.length !== 1 ? 's' : ''}</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#a3e635] text-gray-900 text-sm font-semibold rounded-lg hover:bg-[#bef264] transition-colors"
        >
          <UserPlus size={15} />
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={u => setDeleteTarget(u)}
      />

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        title={modal === 'create' ? 'Add User' : 'Edit User'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input className={input} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </Field>
            <Field label="Last Name">
              <input className={input} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </Field>
          </div>

          <Field label="Username" required>
            <input className={input} value={form.username} required onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </Field>

          <Field label="Email">
            <input type="email" className={input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>

          <Field label="Role" required>
            <select className={input} value={form.role} required onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>

          <Field label={modal === 'create' ? 'Password' : 'New Password (leave blank to keep)'} required={modal === 'create'}>
            <input
              type="password"
              className={input}
              value={modal === 'create' ? form.password : form.new_password}
              required={modal === 'create'}
              onChange={e => setForm(f => modal === 'create'
                ? { ...f, password: e.target.value }
                : { ...f, new_password: e.target.value }
              )}
            />
          </Field>

          {modal === 'edit' && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-[#a3e635] focus:ring-[#a3e635]"
              />
              Active account
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 rounded-lg bg-[#a3e635] text-gray-900 text-sm font-semibold hover:bg-[#bef264] transition-colors disabled:opacity-60">
              {isPending ? 'Saving…' : modal === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete user "${deleteTarget?.username}"? This cannot be undone.`}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a3e635]/50 focus:border-[#a3e635] bg-white'

function formatError(e) {
  const data = e?.response?.data
  if (!data) return 'Something went wrong.'
  if (typeof data === 'string') return data
  const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
  return msgs.join(' | ')
}
