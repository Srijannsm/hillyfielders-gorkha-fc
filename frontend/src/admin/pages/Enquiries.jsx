import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminEnquiries, markEnquiryRead, markAllEnquiriesRead,
  replyToEnquiry, deleteEnquiry,
} from '../services/adminApi'
import ConfirmDialog from '../components/ConfirmDialog'
import { Mail, MailOpen, Trash2, Search, X, CheckCheck, Reply, Send, CheckCircle, AlertCircle } from 'lucide-react'

// ─── Reply Modal ──────────────────────────────────────────────────────────────
function ReplyModal({ enquiry, onClose, onSuccess }) {
  const [message, setMessage] = useState(
    `Hi ${enquiry.name},\n\nThank you for reaching out to HillyFielders Gorkha FC.\n\n\n\nBest regards,\nHillyFielders Gorkha FC`
  )
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error' | 'no-email'
  const [errorMsg, setErrorMsg] = useState('')

  function openMailClient() {
    const subject = encodeURIComponent('Re: Your enquiry to HillyFielders Gorkha FC')
    const body    = encodeURIComponent(message)
    const provider = import.meta.env.VITE_MAIL_PROVIDER ?? 'default'

    let url
    if (provider === 'gmail') {
      url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(enquiry.email)}&su=${subject}&body=${body}`
    } else if (provider === 'outlook') {
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(enquiry.email)}&subject=${subject}&body=${body}`
    } else {
      url = `mailto:${enquiry.email}?subject=${subject}&body=${body}`
    }
    window.open(url, '_blank')
  }

  async function handleSend() {
    setStatus('sending')
    try {
      await replyToEnquiry(enquiry.id, message)
      setStatus('sent')
      setTimeout(() => { onSuccess(); onClose() }, 1200)
    } catch (err) {
      // Any failure (500 = SMTP misconfigured, 503 = not configured) → show mail client fallback
      setStatus('no-email')
      setErrorMsg(err?.response?.data?.error ?? 'Server email is not available.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Reply to {enquiry.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{enquiry.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Quoted original */}
        <div className="mx-5 mt-4 px-3 py-2.5 bg-gray-50 rounded-lg border-l-2 border-gray-300">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Original message</p>
          <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-3">{enquiry.message}</p>
        </div>

        {/* Reply textarea */}
        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Your reply</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            className="input resize-none text-sm"
            placeholder="Type your reply…"
          />
        </div>

        {/* Status messages */}
        {status === 'sent' && (
          <div className="mx-5 mb-3 flex items-center gap-2 text-green-600 text-xs font-medium bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle size={13} /> Reply sent successfully!
          </div>
        )}
        {status === 'no-email' && (
          <div className="mx-5 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg space-y-1.5">
            <p className="font-medium flex items-center gap-1.5"><AlertCircle size={12} /> {errorMsg}</p>
            <p>Use <strong>Open in Mail Client</strong> below to send from your own email app — your reply is already typed and ready.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button
            type="button"
            onClick={openMailClient}
            className="btn-secondary text-sm px-3 flex items-center gap-1.5 whitespace-nowrap"
            title="Opens your default email app with this reply pre-filled"
          >
            <Mail size={13} /> Open in Mail Client
          </button>
          <button
            onClick={handleSend}
            disabled={status === 'sending' || status === 'sent' || status === 'no-email' || !message.trim()}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={13} />
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent!' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Enquiries() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: getAdminEnquiries,
    refetchInterval: 60_000,
  })

  // Invalidate both enquiries list and dashboard (so topbar bell updates too)
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['admin-enquiries'] })
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  const markRead    = useMutation({ mutationFn: markEnquiryRead,      onSuccess: inv })
  const markAllRead = useMutation({ mutationFn: markAllEnquiriesRead,  onSuccess: inv })
  const remove      = useMutation({ mutationFn: deleteEnquiry,         onSuccess: inv })

  const unreadCount = enquiries.filter(e => !e.is_read).length

  const filtered = useMemo(() => {
    let data = enquiries
    if (readFilter === 'unread') data = data.filter(e => !e.is_read)
    if (readFilter === 'read')   data = data.filter(e => e.is_read)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      )
    }
    return data
  }, [enquiries, readFilter, search])

  function handleExpand(id) {
    setExpanded(prev => {
      const next = prev === id ? null : id
      // Auto-mark as read when opened for the first time
      const enq = enquiries.find(e => e.id === id)
      if (next === id && enq && !enq.is_read) {
        markRead.mutate(id)
      }
      return next
    })
  }

  const hasFilters = readFilter !== 'all' || search.trim()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-16 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Reply modal */}
      {replyTarget && (
        <ReplyModal
          enquiry={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSuccess={inv}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Enquiries
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#a3e635] text-gray-900">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{enquiries.length} total submissions from the contact form</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={13} />
            {markAllRead.isPending ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative" style={{ width: '220px' }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email…"
            className="input"
            style={{ paddingLeft: '2rem', paddingTop: '0.375rem', paddingBottom: '0.375rem', fontSize: '0.8125rem' }}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setReadFilter(val)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${readFilter === val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
              {val === 'unread' && unreadCount > 0 && (
                <span className="ml-1 text-[10px] font-bold text-[#65a30d]">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setReadFilter('all') }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{filtered.length} of {enquiries.length}</span>
      </div>

      {/* Enquiry list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
          <Mail size={32} strokeWidth={1} />
          <p className="text-sm">{search || readFilter !== 'all' ? 'No enquiries match your filters.' : 'No enquiries yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(enq => (
            <div
              key={enq.id}
              className={`bg-white rounded-xl border transition-all ${!enq.is_read ? 'border-[#a3e635]/40 shadow-sm' : 'border-gray-200'}`}
            >
              {/* Row header */}
              <div
                className="flex items-start gap-3 p-4 cursor-pointer select-none"
                onClick={() => handleExpand(enq.id)}
              >
                <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${!enq.is_read ? 'bg-[#a3e635]/15 text-[#65a30d]' : 'bg-gray-100 text-gray-400'}`}>
                  {!enq.is_read ? <Mail size={13} /> : <MailOpen size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${!enq.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {enq.name}
                    </span>
                    {!enq.is_read && (
                      <span className="text-[10px] font-bold bg-[#a3e635] text-gray-900 px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                    )}
                    <span className="text-xs text-gray-400">{enq.email}</span>
                    <span className="text-xs text-gray-300 ml-auto flex-shrink-0">
                      {new Date(enq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate text-gray-400">{enq.message}</p>
                </div>
                <svg
                  className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform mt-1 ${expanded === enq.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded body */}
              {expanded === enq.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pt-3">{enq.message}</p>

                  <div className="flex items-center gap-2 pt-3 flex-wrap">
                    {/* Reply button */}
                    <button
                      onClick={e => { e.stopPropagation(); setReplyTarget(enq) }}
                      className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#0f1923] hover:bg-[#1a2c3d] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Reply size={12} />
                      Reply
                    </button>

                    {/* Mark as read / unread toggle */}
                    {!enq.is_read ? (
                      <button
                        onClick={e => { e.stopPropagation(); markRead.mutate(enq.id) }}
                        disabled={markRead.isPending}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <CheckCheck size={12} />
                        Mark as read
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5">
                        <CheckCircle size={12} className="text-green-500" /> Read
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); setToDelete(enq) }}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete enquiry from "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={() => { remove.mutate(toDelete.id); setToDelete(null) }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
