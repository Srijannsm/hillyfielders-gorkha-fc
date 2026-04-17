import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, canAccess } from '../context/AuthContext'
import { getDashboard, markEnquiryRead, markAllEnquiriesRead } from '../services/adminApi'
import { Bell, User, LogOut, ChevronDown, CheckCheck, MailOpen } from 'lucide-react'

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef(null)
  const userRef  = useRef(null)

  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const inv = () => {
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    qc.invalidateQueries({ queryKey: ['admin-enquiries'] })
  }
  const markOne  = useMutation({ mutationFn: markEnquiryRead,      onSuccess: inv })
  const markAll  = useMutation({ mutationFn: markAllEnquiriesRead,  onSuccess: inv })

  const unreadCount     = data?.enquiries_unread ?? 0
  const recentEnquiries = data?.recent_enquiries ?? []

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const canSeeEnquiries = canAccess(user, 'secretary')

  const displayName = user?.username ?? 'Admin'
  const initial = displayName[0]?.toUpperCase() ?? 'A'

  const roleLabels = {
    media_officer: 'Media Officer',
    team_manager:  'Team Manager',
    secretary:     'Secretary',
    coach:         'Coach',
  }
  const roleLabel = user?.isSuperAdmin ? 'Super Admin' : (roleLabels[user?.role] ?? 'Staff')

  function handleLogout() {
    setUserOpen(false)
    logout()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="text-gray-800 font-semibold text-base flex-1 truncate">{title}</h1>

      {/* Right side controls */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Notification bell — only for roles with enquiry access */}
        {canSeeEnquiries && <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#a3e635] rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              {/* Notif header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">
                  Enquiries
                  {unreadCount > 0 && (
                    <span className="ml-1.5 text-[10px] font-bold bg-[#a3e635] text-gray-900 px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAll.mutate()}
                    disabled={markAll.isPending}
                    className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCheck size={11} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notif items */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {recentEnquiries.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No enquiries yet.</p>
                ) : (
                  recentEnquiries.map(e => (
                    <div key={e.id} className={`flex items-start gap-3 px-4 py-3 group ${!e.is_read ? 'bg-[#a3e635]/5' : ''}`}>
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${!e.is_read ? 'bg-[#a3e635]' : 'bg-gray-200'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${!e.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{e.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{e.email}</p>
                        <p className="text-[10px] text-gray-300">
                          {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {/* Per-item mark read */}
                      {!e.is_read && (
                        <button
                          onClick={() => markOne.mutate(e.id)}
                          title="Mark as read"
                          className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-[#65a30d] hover:bg-[#a3e635]/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MailOpen size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer link */}
              <div className="px-4 py-2.5 border-t border-gray-100">
                <Link
                  to="/admin/enquiries"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center text-xs font-medium text-[#65a30d] hover:text-[#4d7c0f] py-1"
                >
                  View all enquiries →
                </Link>
              </div>
            </div>
          )}
        </div>}

        {/* User avatar dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-[#a3e635]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#65a30d] text-xs font-bold">{initial}</span>
            </div>
            <span className="text-sm text-gray-700 font-medium hidden sm:block max-w-[120px] truncate">{displayName}</span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform hidden sm:block flex-shrink-0 ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400">{roleLabel}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
