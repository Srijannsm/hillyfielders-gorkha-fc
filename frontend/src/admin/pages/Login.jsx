import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="GFC" className="h-16 w-16 object-contain mx-auto mb-4"
            onError={e => e.target.style.display = 'none'} />
          <h1 className="text-white font-black text-2xl uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
            Gorkha FC
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a2535] rounded-2xl p-8 space-y-4 border border-white/5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              className="w-full bg-[#0f1923] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635] transition-colors"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className="w-full bg-[#0f1923] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a3e635] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a3e635] text-[#0f1923] font-black text-sm uppercase tracking-widest py-3 rounded-lg hover:bg-[#bef264] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
