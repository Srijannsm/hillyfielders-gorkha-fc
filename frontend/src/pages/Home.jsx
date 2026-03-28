import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getNews, getFixtures } from '../services/api'

function FixtureCard({ fixture }) {
  return (
    <div className="bg-[#2D6A4F] rounded-xl p-4 text-white text-center">
      <p className="text-[#BEFF00] text-xs font-semibold uppercase tracking-wider mb-2">
        {fixture.competition_name}
      </p>
      <div className="flex items-center justify-between gap-4">
        <p className="font-bold text-sm flex-1 text-right">{fixture.home_team_name}</p>
        {fixture.is_completed ? (
          <p className="text-2xl font-black text-[#BEFF00] w-16 text-center">
            {fixture.home_score} – {fixture.away_score}
          </p>
        ) : (
          <p className="text-xs bg-[#1B4332] rounded px-2 py-1 w-16 text-center">VS</p>
        )}
        <p className="font-bold text-sm flex-1 text-left">{fixture.away_team_name}</p>
      </div>
      <p className="text-gray-300 text-xs mt-2">
        {new Date(fixture.date).toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        })}
        {fixture.venue && ` · ${fixture.venue}`}
      </p>
    </div>
  )
}

function NewsCard({ article }) {
  return (
    <Link to={`/news/${article.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-[#1B4332] flex items-center justify-center">
            <span className="text-[#BEFF00] text-4xl font-black">GFC</span>
          </div>
        )}
        <div className="p-4">
          <p className="text-[#1B4332] text-xs font-semibold uppercase tracking-wider mb-1">
            {article.category_name}
          </p>
          <h3 className="font-bold text-gray-800 group-hover:text-[#1B4332] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-400 text-xs mt-2">
            {new Date(article.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { data: news } = useQuery({ queryKey: ['news'], queryFn: getNews })
  const { data: fixtures } = useQuery({
    queryKey: ['fixtures', 'upcoming'],
    queryFn: () => getFixtures('', false)
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1B4332] text-white py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-[#BEFF00] font-semibold uppercase tracking-widest text-sm mb-3">
              Hillyfielders
            </p>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Gorkha FC
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Proudly representing Gorkha, Nepal. One club, two teams, one community.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/mens/squad"
                className="bg-[#BEFF00] text-[#1B4332] font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors"
              >
                Men's Squad
              </Link>
              <Link
                to="/womens/squad"
                className="border border-[#BEFF00] text-[#BEFF00] font-bold px-6 py-3 rounded-lg hover:bg-[#BEFF00] hover:text-[#1B4332] transition-colors"
              >
                Women's Squad
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="Gorkha FC Crest"
              className="w-56 h-56 object-contain drop-shadow-2xl"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
        </div>
      </section>

      {/* Upcoming fixtures */}
      <section className="bg-[#2D6A4F] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-white font-bold text-2xl mb-6">Upcoming Fixtures</h2>
          {fixtures?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fixtures.slice(0, 3).map(f => <FixtureCard key={f.id} fixture={f} />)}
            </div>
          ) : (
            <p className="text-gray-300">No upcoming fixtures scheduled.</p>
          )}
          <div className="mt-6 flex gap-4">
            <Link to="/mens/fixtures" className="text-[#BEFF00] text-sm font-semibold hover:underline">
              All Men's Fixtures →
            </Link>
            <Link to="/womens/fixtures" className="text-[#BEFF00] text-sm font-semibold hover:underline">
              All Women's Fixtures →
            </Link>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[#1B4332] font-bold text-2xl">Latest News</h2>
            <Link to="/news" className="text-[#1B4332] text-sm font-semibold hover:underline">
              All News →
            </Link>
          </div>
          {news?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 3).map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          ) : (
            <p className="text-gray-500">No news published yet.</p>
          )}
        </div>
      </section>

      {/* Club identity strip */}
      <section className="bg-[#1B4332] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[#BEFF00] font-black text-3xl mb-4">
            Built from the Hills of Gorkha
          </h2>
          <p className="text-gray-300 text-lg">
            From the mountains of Gandaki Pradesh, Hillyfielders Gorkha FC
            is more than a football club — we are a community.
          </p>
        </div>
      </section>
    </div>
  )
}