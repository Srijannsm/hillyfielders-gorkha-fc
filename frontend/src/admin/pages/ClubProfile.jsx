import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminClub, updateClub } from '../services/adminApi'

const SECTIONS = [
  { key: 'basics',      label: 'Basics' },
  { key: 'story',       label: 'Our Story' },
  { key: 'mission',     label: 'Mission / Vision / Values' },
  { key: 'programmes',  label: 'Programmes' },
  { key: 'contact',     label: 'Contact & Social' },
]

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function ClubProfile() {
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState('basics')
  const [f, setF] = useState(null)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['admin-club'], queryFn: getAdminClub })
  const update = useMutation({
    mutationFn: updateClub,
    onSuccess: () => { qc.invalidateQueries(['admin-club']); setSaved(true); setTimeout(() => setSaved(false), 2000) },
  })

  useEffect(() => { if (data) setF(data) }, [data])

  if (isLoading || !f) {
    return <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">Loading...</div>
  }

  function set(key, value) { setF(p => ({ ...p, [key]: value })) }
  const inp  = key => ({ value: f[key] ?? '', onChange: e => set(key, e.target.value), className: 'input' })
  const area = (key, rows = 4) => ({ value: f[key] ?? '', onChange: e => set(key, e.target.value), className: 'input resize-y', rows })

  function handleSave(e) {
    e.preventDefault()
    update.mutate(f)
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Section nav */}
      <nav className="flex lg:flex-col gap-1 lg:w-44 flex-shrink-0 overflow-x-auto lg:overflow-visible">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-left transition-colors ${
              activeSection === s.key ? 'bg-[#a3e635]/10 text-[#6b9a1f]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Form */}
      <form onSubmit={handleSave} className="flex-1 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

          {activeSection === 'basics' && <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Founded Year"><input {...inp('founded_year')} /></Field>
              <Field label="Home Ground"><input {...inp('home_ground')} /></Field>
              <Field label="District"><input {...inp('district')} /></Field>
              <Field label="Province"><input {...inp('province')} /></Field>
            </div>
            <Field label="Tagline"><input {...inp('tagline')} /></Field>
          </>}

          {activeSection === 'story' && <>
            <Field label="Heading"><input {...inp('our_story_heading')} /></Field>
            <Field label="Story"><textarea {...area('our_story_body', 8)} /></Field>
            <Field label="Ground Story"><textarea {...area('ground_story', 6)} /></Field>
          </>}

          {activeSection === 'mission' && <>
            <Field label="Mission"><textarea {...area('mission', 4)} /></Field>
            <Field label="Vision"><textarea {...area('vision', 4)} /></Field>
            <Field label="Values"><textarea {...area('values', 4)} /></Field>
          </>}

          {activeSection === 'programmes' && <>
            <Field label="Programmes Heading"><input {...inp('programmes_heading')} /></Field>
            <Field label="Programmes Body"><textarea {...area('programmes_body', 4)} /></Field>
            <Field label="Active Programmes (one per line)"><textarea {...area('active_programmes', 4)} /></Field>
            <Field label="Coming Soon (one per line)"><textarea {...area('coming_soon_programmes', 4)} /></Field>
          </>}

          {activeSection === 'contact' && <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email"><input type="email" {...inp('email')} /></Field>
              <Field label="Phone"><input {...inp('phone')} /></Field>
            </div>
            <Field label="Facebook URL"><input type="url" {...inp('facebook_url')} /></Field>
            <Field label="Instagram URL"><input type="url" {...inp('instagram_url')} /></Field>
            <Field label="YouTube URL"><input type="url" {...inp('youtube_url')} /></Field>
          </>}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={update.isPending} className="btn-primary px-8">
            {update.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
          {update.isError && <span className="text-red-500 text-sm">Failed to save. Please try again.</span>}
        </div>
      </form>
    </div>
  )
}
