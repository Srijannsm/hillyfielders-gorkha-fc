import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminClub, updateClub } from '../services/adminApi'
import {
  Building2, BookOpen, Target, Users, Phone, CheckCircle, AlertCircle,
} from 'lucide-react'

const SECTIONS = [
  { key: 'basics',     label: 'Basics',              icon: Building2 },
  { key: 'story',      label: 'Our Story',            icon: BookOpen  },
  { key: 'mission',    label: 'Mission & Values',     icon: Target    },
  { key: 'programmes', label: 'Programmes',           icon: Users     },
  { key: 'contact',    label: 'Contact & Social',     icon: Phone     },
]

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {hint && <span className="ml-1.5 font-normal text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function ClubProfile() {
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState('basics')
  const [f, setF] = useState(null)
  const [original, setOriginal] = useState(null)
  const [toast, setToast] = useState(null) // 'success' | 'error'

  const { data, isLoading } = useQuery({ queryKey: ['admin-club'], queryFn: getAdminClub })

  const update = useMutation({
    mutationFn: updateClub,
    onSuccess: updated => {
      qc.invalidateQueries(['admin-club'])
      setOriginal(updated)
      setF(updated)
      showToast('success')
    },
    onError: () => showToast('error'),
  })

  useEffect(() => {
    if (data) { setF(data); setOriginal(data) }
  }, [data])

  function showToast(type) {
    setToast(type)
    setTimeout(() => setToast(null), 3000)
  }

  if (isLoading || !f) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-8 h-64 animate-pulse" />
      </div>
    )
  }

  function set(key, value) { setF(p => ({ ...p, [key]: value })) }
  const inp  = (key, extra = {}) => ({ value: f[key] ?? '', onChange: e => set(key, e.target.value), className: 'input', ...extra })
  const area = (key, rows = 4) => ({ value: f[key] ?? '', onChange: e => set(key, e.target.value), className: 'input resize-y', rows })

  const isDirty = JSON.stringify(f) !== JSON.stringify(original)

  function handleSave(e) {
    e.preventDefault()
    update.mutate(f)
  }

  const ActiveIcon = SECTIONS.find(s => s.key === activeSection)?.icon ?? Building2
  const activeLabel = SECTIONS.find(s => s.key === activeSection)?.label ?? ''

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast === 'success' ? 'bg-[#a3e635] text-gray-900' : 'bg-red-500 text-white'}`}>
          {toast === 'success'
            ? <><CheckCircle size={15} /> Changes saved successfully.</>
            : <><AlertCircle size={15} /> Failed to save. Please try again.</>}
        </div>
      )}

      {/* Section tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
              ${activeSection === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {/* Section card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <ActiveIcon size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">{activeLabel}</h3>
            {isDirty && (
              <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">
            {activeSection === 'basics' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Founded Year"><input {...inp('founded_year')} placeholder="e.g. 2010" /></Field>
                  <Field label="Home Ground"><input {...inp('home_ground')} placeholder="Stadium name" /></Field>
                  <Field label="District"><input {...inp('district')} placeholder="Gorkha" /></Field>
                  <Field label="Province"><input {...inp('province')} placeholder="Gandaki Province" /></Field>
                </div>
                <Field label="Tagline" hint="(shown on homepage)">
                  <input {...inp('tagline')} placeholder="Your club's motto or tagline" />
                </Field>
              </>
            )}

            {activeSection === 'story' && (
              <>
                <Field label="Section Heading">
                  <input {...inp('our_story_heading')} placeholder="e.g. Our Journey" />
                </Field>
                <Field label="Club Story">
                  <textarea {...area('our_story_body', 9)} placeholder="Tell the story of the club's founding and history…" />
                </Field>
                <Field label="Ground Story" hint="(optional — about the home ground)">
                  <textarea {...area('ground_story', 5)} placeholder="History of the ground…" />
                </Field>
              </>
            )}

            {activeSection === 'mission' && (
              <>
                <Field label="Mission">
                  <textarea {...area('mission', 4)} placeholder="What the club is working towards…" />
                </Field>
                <Field label="Vision">
                  <textarea {...area('vision', 4)} placeholder="Long-term aspirations…" />
                </Field>
                <Field label="Values" hint="(comma-separated or prose)">
                  <textarea {...area('values', 4)} placeholder="Integrity, Teamwork, Community…" />
                </Field>
              </>
            )}

            {activeSection === 'programmes' && (
              <>
                <Field label="Section Heading">
                  <input {...inp('programmes_heading')} placeholder="e.g. Our Programmes" />
                </Field>
                <Field label="Introduction">
                  <textarea {...area('programmes_body', 4)} placeholder="Brief intro about the club's programmes…" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Active Programmes" hint="(one per line)">
                    <textarea {...area('active_programmes', 5)} placeholder={"Men's Senior\nWomen's Senior\nU-16"} />
                  </Field>
                  <Field label="Coming Soon" hint="(one per line)">
                    <textarea {...area('coming_soon_programmes', 5)} placeholder={"Academy\nFutsal"} />
                  </Field>
                </div>
              </>
            )}

            {activeSection === 'contact' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <input type="email" {...inp('email')} placeholder="club@example.com" />
                  </Field>
                  <Field label="Phone">
                    <input {...inp('phone')} placeholder="+977 …" />
                  </Field>
                </div>
                <div className="space-y-3">
                  <Field label="Facebook URL">
                    <input type="url" {...inp('facebook_url')} placeholder="https://facebook.com/…" />
                  </Field>
                  <Field label="Instagram URL">
                    <input type="url" {...inp('instagram_url')} placeholder="https://instagram.com/…" />
                  </Field>
                  <Field label="YouTube URL">
                    <input type="url" {...inp('youtube_url')} placeholder="https://youtube.com/…" />
                  </Field>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save bar */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={update.isPending || !isDirty}
            className={`btn-primary px-8 transition-opacity ${!isDirty && !update.isPending ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {update.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={() => setF(original)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Discard
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
