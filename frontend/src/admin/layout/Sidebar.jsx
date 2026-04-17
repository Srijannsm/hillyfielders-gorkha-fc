import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth, canAccess } from '../context/AuthContext'
import { getDashboard } from '../services/adminApi'
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Newspaper,
  Images,
  Handshake,
  Settings2,
  LogOut,
  Mail,
  UserCog,
} from 'lucide-react'

const nav = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, exact: true,  roles: null },
  { to: '/admin/players',    label: 'Players',      icon: Users,                          roles: ['team_manager', 'coach'] },
  { to: '/admin/teams',      label: 'Teams',        icon: Shield,                         roles: ['team_manager', 'coach'] },
  { to: '/admin/fixtures',   label: 'Fixtures',     icon: CalendarDays,                   roles: ['team_manager', 'secretary', 'coach'] },
  { to: '/admin/news',       label: 'News',         icon: Newspaper,                      roles: ['media_officer'] },
  { to: '/admin/gallery',    label: 'Gallery',      icon: Images,                         roles: ['media_officer', 'coach'] },
  { to: '/admin/sponsors',   label: 'Sponsors',     icon: Handshake,                      roles: ['secretary'] },
  { to: '/admin/enquiries',  label: 'Enquiries',    icon: Mail,      badge: true,         roles: ['secretary'] },
  { to: '/admin/club',       label: 'Club Profile', icon: Settings2,                      roles: ['secretary'] },
  { to: '/admin/users',      label: 'Users',        icon: UserCog,   superOnly: true,     roles: null },
]

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth()

  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const unreadEnquiries = data?.enquiries_unread ?? 0

  const visibleNav = nav.filter(item => {
    if (item.superOnly) return user?.isSuperAdmin
    if (item.roles === null) return true
    return canAccess(user, ...item.roles)
  })

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-[#0f1923] border-r border-white/5
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <img src="/logo.png" alt="GFC" className="h-8 w-8 object-contain"
            onError={e => e.target.style.display = 'none'} />
          <div>
            <p className="text-white font-black text-sm uppercase tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
              HillyFielders Gorkha FC
            </p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {visibleNav.map(({ to, label, icon: Icon, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-[#a3e635]/10 text-[#a3e635]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && unreadEnquiries > 0 && (
                <span className="text-[10px] font-bold bg-[#a3e635] text-gray-900 px-1.5 py-0.5 rounded-full leading-none">
                  {unreadEnquiries}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
