import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../services/adminApi'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
  })

  const stats = [
    { label: 'Total Players',      value: data?.players,            icon: '👤', accent: true },
    { label: 'Coaching Staff',     value: data?.staff,              icon: '🦺' },
    { label: 'Teams',              value: data?.teams,              icon: '🛡' },
    { label: 'Upcoming Fixtures',  value: data?.fixtures_upcoming,  icon: '📅', accent: true },
    { label: 'Total Fixtures',     value: data?.fixtures_total,     icon: '⚽' },
    { label: 'Published Articles', value: data?.articles_published, icon: '📰', accent: true },
    { label: 'Total Articles',     value: data?.articles_total,     icon: '📄' },
    { label: 'Gallery Photos',     value: data?.photos,             icon: '🖼' },
    { label: 'Active Sponsors',    value: data?.sponsors,           icon: '🤝' },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Overview</h2>
        <p className="text-sm text-gray-500">Club stats at a glance</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  )
}
