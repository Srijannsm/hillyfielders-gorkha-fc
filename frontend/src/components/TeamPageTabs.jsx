import { Link, useLocation } from 'react-router-dom'

export default function TeamPageTabs({ teamType }) {
  const { pathname } = useLocation()
  const isSquad    = pathname.endsWith('/squad')
  const isResults  = pathname.endsWith('/results')
  const isFixtures = pathname.endsWith('/fixtures')

  const tab = (label, to, active) => (
    <Link
      to={to}
      className={`px-6 py-3.5 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
        active
          ? 'text-gfc-700 border-gfc-700'
          : 'text-gray-400 border-transparent hover:text-gfc-700 hover:border-gfc-700'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 flex">
        {tab('Squad',    `/${teamType}/squad`,    isSquad)}
        {tab('Fixtures', `/${teamType}/fixtures`, isFixtures)}
        {tab('Results',  `/${teamType}/results`,  isResults)}
      </div>
    </div>
  )
}
