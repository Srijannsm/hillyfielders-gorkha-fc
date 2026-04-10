import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getAdminProfile, updateAdminProfile } from '../services/adminApi'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [toast, setToast] = useState(null) // { type: 'success'|'error', msg }
  const [f, setF] = useState({
    first_name: '', last_name: '', username: '', email: '',
    current_password: '', new_password: '', confirm_password: '',
  })
  const [errors, setErrors] = useState({})

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: getAdminProfile,
  })

  useEffect(() => {
    if (profile) {
      setF(prev => ({
        ...prev,
        first_name: profile.first_name ?? '',
        last_name:  profile.last_name  ?? '',
        username:   profile.username   ?? '',
        email:      profile.email      ?? '',
      }))
    }
  }, [profile])

  const save = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      setF(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }))
      setErrors({})
      showToast('success', 'Profile updated successfully.')
    },
    onError: err => {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        setErrors(data)
      }
      showToast('error', 'Failed to update profile. Check the form.')
    },
  })

  function showToast(type, msg) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}
    if (f.new_password && f.new_password !== f.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.'
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    const payload = {
      first_name: f.first_name,
      last_name:  f.last_name,
      username:   f.username,
      email:      f.email,
    }
    if (f.new_password) {
      payload.current_password = f.current_password
      payload.new_password     = f.new_password
    }
    save.mutate(payload)
  }

  const initial = (profile?.first_name?.[0] ?? profile?.username?.[0] ?? user?.username?.[0] ?? 'A').toUpperCase()
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || user?.username

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in
          ${toast.type === 'success' ? 'bg-[#a3e635] text-gray-900' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Avatar + name card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#a3e635]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[#65a30d] text-2xl font-black">{initial}</span>
        </div>
        <div>
          <p className="text-gray-900 font-semibold">{fullName}</p>
          <p className="text-gray-400 text-sm">@{profile?.username}</p>
          <p className="text-xs mt-1 text-gray-400">{profile?.email || 'No email set'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input value={f.first_name} onChange={e => setF(p => ({ ...p, first_name: e.target.value }))}
                className="input" placeholder="First name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input value={f.last_name} onChange={e => setF(p => ({ ...p, last_name: e.target.value }))}
                className="input" placeholder="Last name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Username *</label>
              <input required value={f.username} onChange={e => setF(p => ({ ...p, username: e.target.value }))}
                className={`input ${errors.username ? 'border-red-300' : ''}`} />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Mail size={11} /> Email
              </label>
              <input type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))}
                className={`input ${errors.email ? 'border-red-300' : ''}`} placeholder="admin@club.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Change Password</h3>
            <span className="text-xs text-gray-400 font-normal">(leave blank to keep current)</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" value={f.current_password}
              onChange={e => setF(p => ({ ...p, current_password: e.target.value }))}
              className={`input ${errors.current_password ? 'border-red-300' : ''}`} />
            {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
              <input type="password" value={f.new_password}
                onChange={e => setF(p => ({ ...p, new_password: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
              <input type="password" value={f.confirm_password}
                onChange={e => setF(p => ({ ...p, confirm_password: e.target.value }))}
                className={`input ${errors.confirm_password ? 'border-red-300' : ''}`} />
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={save.isPending} className="btn-primary w-full">
          {save.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
