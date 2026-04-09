import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
} from 'lucide-react'

const nav = [
  { to: '/admin',           label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/players',   label: 'Players',      icon: Users           },
  { to: '/admin/teams',     label: 'Teams',        icon: Shield          },
  { to: '/admin/fixtures',  label: 'Fixtures',     icon: CalendarDays    },
  { to: '/admin/news',      label: 'News',         icon: Newspaper       },
  { to: '/admin/gallery',   label: 'Gallery',      icon: Images          },
  { to: '/admin/sponsors',  label: 'Sponsors',     icon: Handshake       },
  { to: '/admin/club',      label: 'Club Profile', icon: Settings2       },
]

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth()

  return (
    <>
      {/* Overlay for mobile */}
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
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
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
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-[#a3e635]/20 flex items-center justify-center">
              <span className="text-[#a3e635] text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="text-gray-300 text-sm truncate">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          >
            <span className="text-base w-5 text-center">↩</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
