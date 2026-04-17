import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../services/adminApi'
import { useAuth, canAccess } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import {
  Users, UserCheck, Shield, CalendarDays, Newspaper,
  Images, Handshake, Mail, TrendingUp, Clock, Trophy,
  ArrowRight, AlertCircle,
} from 'lucide-react'

const RESULT_COLOR = {
  W: 'bg-green-50 text-green-600 border-green-100',
  L: 'bg-red-50 text-red-500 border-red-100',
  D: 'bg-gray-100 text-gray-500 border-gray-200',
}

function StatCard({ label, value, icon: Icon, accent, sub }) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${accent ? 'border-[#a3e635]/30' : 'border-gray-200'}`}>
      <div className={`p-2 rounded-lg flex-shrink-0 ${accent ? 'bg-[#a3e635]/10' : 'bg-gray-50'}`}>
        <Icon size={16} className={accent ? 'text-[#65a30d]' : 'text-gray-500'} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, badge }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#a3e635]/50 hover:bg-[#a3e635]/5 transition-all group"
    >
      <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-[#a3e635]/15 transition-colors">
        <Icon size={14} className="text-gray-500 group-hover:text-[#65a30d]" />
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] font-bold bg-[#a3e635] text-gray-900 px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
      <ArrowRight size={13} className="text-gray-300 group-hover:text-[#65a30d] transition-colors" />
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
    refetchInterval: 120_000,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = user?.username ?? 'Admin'

  // Role helpers
  const canSquad    = canAccess(user, 'team_manager', 'coach')
  const canFixtures = canAccess(user, 'team_manager', 'secretary', 'coach')
  const canNews     = canAccess(user, 'media_officer')
  const canGallery  = canAccess(user, 'media_officer', 'coach')
  const canEnquiries= canAccess(user, 'secretary')
  const canSponsors = canAccess(user, 'secretary')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={32} className="text-gray-300" />
        <p className="text-gray-500 text-sm">Failed to load dashboard.</p>
        <button onClick={() => refetch()}
          className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  // Build quick actions visible to this user
  const quickActions = [
    canSquad    && { to: '/admin/players',   icon: Users,       label: 'Manage Players & Staff' },
    canFixtures && { to: '/admin/fixtures',  icon: CalendarDays, label: 'Add / Edit Fixtures' },
    canNews     && { to: '/admin/news',      icon: Newspaper,   label: 'Write New Article' },
    canGallery  && { to: '/admin/gallery',   icon: Images,      label: 'Upload Photos' },
    canEnquiries&& { to: '/admin/enquiries', icon: Mail,        label: 'View Enquiries', badge: data?.enquiries_unread },
    canSponsors && { to: '/admin/sponsors',  icon: Handshake,   label: 'Manage Sponsors' },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {greeting}, {displayName} 👋
        </h2>
        <p className="text-sm text-gray-400">Here's what's happening at HillyFielders Gorkha FC.</p>
      </div>

      {/* Squad overview — team_manager, coach, super_admin */}
      {canSquad && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Squad Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Active Players" value={data?.active_players} icon={UserCheck} accent />
            <StatCard label="Total Players"  value={data?.players}        icon={Users} />
            <StatCard label="Coaching Staff" value={data?.staff}          icon={Shield} />
            <StatCard label="Teams"          value={data?.teams}          icon={Trophy} />
          </div>
        </div>
      )}

      {/* Fixtures stats — team_manager, secretary, coach, super_admin */}
      {canFixtures && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fixtures</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Upcoming Fixtures" value={data?.fixtures_upcoming}  icon={CalendarDays} accent />
            <StatCard label="Matches Played"    value={data?.fixtures_completed} icon={Trophy} />
            <StatCard label="Total Fixtures"    value={data?.fixtures_total}     icon={CalendarDays} />
          </div>
        </div>
      )}

      {/* Content stats — media_officer, coach (gallery only), secretary (enquiries), super_admin */}
      {(canNews || canGallery || canEnquiries || canSponsors) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Content & Engagement</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {canNews && (
              <>
                <StatCard label="Published Articles" value={data?.articles_published} icon={Newspaper} accent />
                <StatCard label="Total Articles"     value={data?.articles_total}     icon={Newspaper} />
              </>
            )}
            {canGallery && (
              <StatCard label="Gallery Photos" value={data?.photos} icon={Images} accent={!canNews} />
            )}
            {canEnquiries && (
              <StatCard
                label="Unread Enquiries"
                value={data?.enquiries_unread}
                icon={Mail}
                accent={data?.enquiries_unread > 0}
                sub={`${data?.enquiries_total ?? 0} total`}
              />
            )}
            {canSponsors && (
              <StatCard label="Active Sponsors" value={data?.sponsors} icon={Handshake} />
            )}
          </div>
        </div>
      )}

      {/* Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming fixtures */}
        {canFixtures && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Upcoming Fixtures</h3>
              </div>
              <Link to="/admin/fixtures" className="text-xs text-[#65a30d] hover:underline font-medium">View all</Link>
            </div>
            {!data?.upcoming_fixtures?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No upcoming fixtures scheduled.</p>
            ) : (
              <div className="space-y-2">
                {data.upcoming_fixtures.map(f => (
                  <div key={f.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{f.home} vs {f.away}</p>
                      <p className="text-[10px] text-gray-400">{new Date(f.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}{f.venue ? ` · ${f.venue}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent results */}
        {canFixtures && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Results</h3>
              </div>
              <Link to="/admin/fixtures" className="text-xs text-[#65a30d] hover:underline font-medium">View all</Link>
            </div>
            {!data?.recent_fixtures?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No completed fixtures yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_fixtures.map(f => (
                  <div key={f.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    {f.result && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${RESULT_COLOR[f.result] ?? ''}`}>
                        {f.result}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {f.home} {f.home_score ?? '?'} – {f.away_score ?? '?'} {f.away}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(f.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent enquiries — secretary, super_admin */}
        {canEnquiries && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Enquiries</h3>
                {data?.enquiries_unread > 0 && (
                  <span className="text-[10px] font-bold bg-[#a3e635] text-gray-900 px-1.5 py-0.5 rounded-full">
                    {data.enquiries_unread} new
                  </span>
                )}
              </div>
              <Link to="/admin/enquiries" className="text-xs text-[#65a30d] hover:underline font-medium">View all</Link>
            </div>
            {!data?.recent_enquiries?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No enquiries yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_enquiries.map(e => (
                  <div key={e.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${!e.is_read ? 'bg-[#a3e635]' : 'bg-gray-200'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{e.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{e.email}</p>
                    </div>
                    <p className="text-[10px] text-gray-300 flex-shrink-0">
                      {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent articles — media_officer, super_admin */}
        {canNews && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Articles</h3>
              </div>
              <Link to="/admin/news" className="text-xs text-[#65a30d] hover:underline font-medium">View all</Link>
            </div>
            {!data?.recent_articles?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No articles yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_articles.map(a => (
                  <div key={a.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${a.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {a.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {quickActions.map(action => (
              <QuickLink key={action.to} {...action} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
