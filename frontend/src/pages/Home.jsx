import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getNews, getFixtures, getSponsors, getProgrammes } from '../services/api'
import SEO from '../components/SEO'

const MENS_SLUG = 'mens-senior'
const WOMENS_SLUG = 'womens-u16'

/* ── News card ─────────────────────────────────────────── */
function NewsCard({ article, featured = false }) {
  return (
    <Link to={`/news/${article.slug}`} className="group block h-full">
      <div className={`relative overflow-hidden bg-gfc-800 h-full ${featured ? 'min-h-[440px]' : 'min-h-[240px]'}`}>
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gfc-800">
            <span className="text-gfc-lime/[0.07] font-black select-none" style={{ fontSize: '120px', lineHeight: 1 }}>GFC</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest mb-2">
            {article.category_name || 'Club News'}
          </p>
          <h3 className={`text-white font-black uppercase leading-tight group-hover:text-gfc-lime transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-sm'}`}>
            {article.title}
          </h3>
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
            <span className="w-3 h-px bg-gfc-lime inline-block flex-shrink-0" />
            {new Date(article.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ── Single programme fixture column ───────────────────── */
function FixtureColumn({ label, slug, fixture, isLoading }) {
  // Detect GFC's side by club name — more reliable than the is_home_game flag
  const gfcPattern = /hillyfielders|gorkha\s*fc/i
  const gfcIsHome = fixture
    ? gfcPattern.test(fixture.home_team_name)
    : true

  return (
    <div className="flex-1 px-8 py-8 flex flex-col gap-5">
      {/* Programme label */}
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 bg-gfc-lime flex-shrink-0" />
        <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>

      {isLoading ? (
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Loading...</p>
      ) : fixture ? (
        <>
          {/* Squad badge — centered above the matchup */}

          {/* Teams + VS */}
          <div className="flex items-center gap-3">
            <p className="text-white font-black uppercase text-sm md:text-base flex-1 text-right leading-tight">
              {fixture.home_team_name}
            </p>
            <span className="bg-gfc-lime text-gfc-900 font-black text-[10px] px-3 py-1.5 flex-shrink-0 tracking-widest">
              VS
            </span>
            <p className="text-white font-black uppercase text-sm md:text-base flex-1 leading-tight">
              {fixture.away_team_name}
            </p>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">
                {new Date(fixture.date).toLocaleDateString('en-GB', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
                {' · '}
                {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {fixture.venue && (
                <p className="text-gray-600 text-xs mt-0.5">{fixture.venue}</p>
              )}
              <p className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-wide">
                {fixture.competition_name || 'Friendly'}
              </p>
            </div>
            <Link
              to={`/${slug}/fixtures`}
              className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              All Fixtures <span>→</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-xs uppercase tracking-widest">No upcoming fixtures</p>
          <Link
            to={`/${slug}/fixtures`}
            className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
          >
            Fixtures <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}

/* ── Two-column fixtures band ──────────────────────────── */
function FixturesBand({ mensFixtures, womensFixtures, mensLoading, womensLoading }) {
  return (
    <section className="bg-gfc-900 border-y border-gfc-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gfc-700">
          <FixtureColumn
            label="Men's Programme"
            slug={MENS_SLUG}
            fixture={mensFixtures?.[0] ?? null}
            isLoading={mensLoading}
          />
          <FixtureColumn
            label="Women's Programme"
            slug={WOMENS_SLUG}
            fixture={womensFixtures?.[0] ?? null}
            isLoading={womensLoading}
          />
        </div>
      </div>
    </section>
  )
}

/* ── Stat cell ─────────────────────────────────────────── */
function Stat({ number, label }) {
  return (
    <div className="text-center px-6 py-16 border-r border-gfc-900/15 last:border-r-0">
      <p className="text-gfc-900 font-black leading-none" style={{ fontSize: 'clamp(40px, 5vw, 60px)', fontFamily: 'Oswald, sans-serif' }}>
        {number}
      </p>
      <p className="text-gfc-700 font-bold text-[10px] uppercase tracking-widest mt-1.5">{label}</p>
    </div>
  )
}

/* ── Programme card (on white bg) ─────────────────────── */
function ProgrammeCard({ programme, name, to, description }) {
  return (
    <Link to={to} className="block group">
      <div className="flex flex-col h-[280px] p-7 border-t-2 border-t-gfc-lime bg-gfc-900 hover:bg-gfc-800 transition-colors overflow-hidden">
        <p className="text-gfc-lime/60 text-[9px] font-black uppercase tracking-widest mb-3">
          {programme}
        </p>
        <h3 className="text-white font-black uppercase leading-tight mb-3"
          style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(22px, 2.5vw, 28px)' }}>
          {name}
        </h3>
        {description && (
          <p className="text-gray-400 text-xs leading-relaxed flex-1">{description}</p>
        )}
        <div className="mt-5">
          <span className="text-gfc-lime text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-block">
            View Squad →
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ══════════════════════════════════════════════════════════ */
export default function Home() {
  const { data: news } = useQuery({ queryKey: ['news'], queryFn: getNews })
  const { data: programmes = [] } = useQuery({ queryKey: ['programmes'], queryFn: getProgrammes })
  const { data: mensFixtures, isLoading: mensLoading } = useQuery({
    queryKey: ['fixtures', MENS_SLUG, 'upcoming'],
    queryFn: () => getFixtures(MENS_SLUG, false),
  })
  const { data: womensFixtures, isLoading: womensLoading } = useQuery({
    queryKey: ['fixtures', WOMENS_SLUG, 'upcoming'],
    queryFn: () => getFixtures(WOMENS_SLUG, false),
  })
  const { data: sponsors } = useQuery({ queryKey: ['sponsors'], queryFn: getSponsors })

  return (
    <div>
      <SEO
        title="Home"
        description="Official website of Hillyfielders Gorkha FC — grassroots football from the heart of Gorkha, Nepal. U-16 Girls team, Academy programme and senior teams coming soon."
      />

      {/* ── HERO (dark) ──────────────────────────────────── */}
      <section className="hero-bg min-h-screen flex flex-col justify-end relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-8 pointer-events-none hidden lg:flex">
          <img src="/logo.png" alt="" className="w-[480px] h-[480px] object-contain opacity-[0.6]" onError={e => e.target.style.display = 'none'} />
        </div>
        <div className="max-w-7xl mx-auto w-full px-6 pb-24 relative z-10">
          <p className="eyebrow mb-7">Gorkha, Nepal · Est. 2024</p>
          <h1 className="font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}>
            <span className="block text-white">Hillyfielders</span>
            <span className="block text-gfc-lime">Gorkha FC</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md leading-relaxed mb-10">
            Grassroots football from the heart of Gorkha — building the next generation of Nepali footballers.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/about" className="bg-gfc-lime text-gfc-900 font-black px-8 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors">
              About Us
            </Link>
            <Link to="/news" className="border border-white/20 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors">
              Latest News
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gfc-900/60 to-transparent pointer-events-none" />
      </section>


      {/* ── FIXTURES (dark, two columns) ─────────────────── */}
      <FixturesBand
        mensFixtures={mensFixtures}
        womensFixtures={womensFixtures}
        mensLoading={mensLoading}
        womensLoading={womensLoading}
      />

      {/* ── STATS STRIP (lime) ───────────────────────────── */}
      <section className="bg-gfc-lime">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <Stat number="2024" label="Year Founded" />
          <Stat number="500+" label="Facebook Followers" />
          <Stat number="U-16" label="Girls Team Active" />
          <Stat number="TOC" label="Home Turf, Gorkha" />
        </div>
      </section>

      {/* ── LATEST NEWS (white) ──────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow-light mb-4">From the Club</p>
              <h2 className="text-gray-900 font-black uppercase" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}>
                Latest News
              </h2>
            </div>
            <Link to="/news" className="text-gfc-700 text-[10px] font-black uppercase tracking-widest hover:text-gfc-500 transition-colors flex items-center gap-2">
              All News <span>→</span>
            </Link>
          </div>

          {news?.length >= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><NewsCard article={news[0]} featured /></div>
              <div className="flex flex-col gap-4">
                {news.slice(1, 3).map(a => (
                  <div key={a.id} className="flex-1"><NewsCard article={a} /></div>
                ))}
              </div>
            </div>
          ) : news?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.slice(0, 3).map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          ) : (
            <div className="border border-gray-100 p-20 text-center bg-gray-50">
              <p className="text-gfc-700/30 font-black text-5xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No news published yet</p>
            </div>
          )}
        </div>
      </section>

      {/* ── OUR PROGRAMMES (white/light) ─────────────────── */}
      {programmes.some(p => p.teams.length > 0) && (
        <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="eyebrow-light mb-4">The Club</p>
              <h2 className="text-gray-900 font-black uppercase" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Our Programmes
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {programmes.flatMap(programme =>
                programme.teams.map(team => (
                  <ProgrammeCard
                    key={team.slug}
                    programme={programme.name}
                    name={team.name}
                    to={`/${team.slug}/squad`}
                    description={team.description}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── HOME GROUND (dark) ───────────────────────────── */}
      <section className="bg-gfc-900 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-5">Our Stadium</p>
            <h2 className="text-white font-black uppercase leading-tight mb-5" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
              TOC Turf,<br />Gorkha
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6 max-w-md">
              Hillyfielders Gorkha FC calls TOC Turf home — a 5-a-side turf in the heart of Gorkha district.
              This is where our academy sessions run, our U-16 girls train, and where the future of
              Gorkha football is being built.
            </p>
            <p className="text-gfc-lime text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <span className="w-5 h-px bg-gfc-lime" />
              Gorkha, Gandaki Pradesh, Nepal
            </p>
          </div>
          <div className="border border-gfc-700 bg-gfc-800 relative overflow-hidden min-h-[280px] flex flex-col">
            {/* Pitch markings */}
            <div className="absolute inset-6 border border-gfc-700/20" />
            <div className="absolute left-1/2 top-6 bottom-6 w-px bg-gfc-700/20 -translate-x-1/2" />
            <div className="absolute left-1/2 top-1/2 w-24 h-24 border border-gfc-700/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col justify-between flex-1">
              <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">Home Ground</p>
              <div>
                <p className="text-white font-black uppercase leading-none" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '48px' }}>
                  TOC TURF
                </p>
                <p className="text-gray-500 text-sm mt-2">Gorkha, Nepal</p>
              </div>
              <div className="flex flex-col gap-2">
                {['5-a-side turf', 'Training ground', 'Home of Hillyfielders'].map(item => (
                  <p key={item} className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gfc-lime rounded-full flex-shrink-0" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPONSORS STRIP (white) ───────────────────────── */}
      {sponsors?.length > 0 && (
        <section className="bg-white py-12 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest text-center mb-8">Club Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-12">
              {sponsors.slice(0, 6).map(s => (
                <a key={s.id} href={s.website || '#'} target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-80 transition-opacity">
                  {s.logo ? (
                    <img src={s.logo} alt={s.name} className="h-10 object-contain grayscale hover:grayscale-0 transition-all" />
                  ) : (
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{s.name}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOLLOW CTA (dark) ────────────────────────────── */}
      <section className="bg-gfc-900 py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/logo.png" alt="" className="w-[600px] h-[600px] object-contain opacity-[0.03]" onError={e => e.target.style.display = 'none'} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="eyebrow mb-6" style={{ display: 'flex', justifyContent: 'center' }}>Stay Connected</p>
          <h2 className="text-white font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}>
            Follow the <span className="text-gfc-lime">Journey</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            From the hills of Gandaki Pradesh — follow Hillyfielders Gorkha FC for match updates, training photos, and club news.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://www.facebook.com/HillyFielders/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gfc-lime text-gfc-900 font-black px-8 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-3"
            >
              Follow on Facebook
              <span className="bg-gfc-900/20 text-gfc-900 text-[9px] font-black px-2 py-0.5 tracking-normal normal-case rounded-full whitespace-nowrap">
                507+ followers
              </span>
            </a>
            <Link to="/contact" className="border border-gfc-700 text-gray-300 font-bold px-8 py-4 text-xs uppercase tracking-widest hover:border-gfc-lime hover:text-gfc-lime transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
