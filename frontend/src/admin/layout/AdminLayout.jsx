import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/admin':          'Dashboard',
  '/admin/players':  'Players & Staff',
  '/admin/teams':    'Teams & Programmes',
  '/admin/fixtures': 'Fixtures',
  '/admin/news':     'News & Articles',
  '/admin/gallery':  'Gallery',
  '/admin/sponsors': 'Sponsors',
  '/admin/club':     'Club Profile',
}

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <Navigate to="/admin/login" replace />

  const title = pageTitles[location.pathname] ?? 'Admin'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
