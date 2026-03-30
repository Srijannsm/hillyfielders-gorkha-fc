import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getNews, getFixtures, getSponsors, getProgrammes, getGallery } from '../services/api'
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

/* ── Fixture column ─────────────────────────────────────── */
function FixtureColumn({ label, slug, fixture, isLoading }) {
  return (
    <div className="flex-1 px-8 py-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 bg-gfc-lime flex-shrink-0" />
        <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      {isLoading ? (
        <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Loading...</p>
      ) : fixture ? (
        <>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">
                {new Date(fixture.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {new Date(fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {fixture.venue && <p className="text-gray-600 text-xs mt-0.5">{fixture.venue}</p>}
              <p className="text-gray-600 text-[10px] mt-0.5 uppercase tracking-wide">{fixture.competition_name || 'Friendly'}</p>
            </div>
            <Link to={`/${slug}/fixtures`} className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0">
              All Fixtures <span>→</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-xs uppercase tracking-widest">No upcoming fixtures</p>
          <Link to={`/${slug}/fixtures`} className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
            Fixtures <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}

function FixturesBand({ mensFixtures, womensFixtures, mensLoading, womensLoading }) {
  return (
    <section className="bg-gfc-900 border-y border-gfc-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gfc-700">
          <FixtureColumn label="Men's Programme" slug={MENS_SLUG} fixture={mensFixtures?.[0] ?? null} isLoading={mensLoading} />
          <FixtureColumn label="Women's Programme" slug={WOMENS_SLUG} fixture={womensFixtures?.[0] ?? null} isLoading={womensLoading} />
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

/* ── Programme card ────────────────────────────────────── */
function ProgrammeCard({ programme, name, to, description, index }) {
  return (
    <Link to={to} className="block group">
      <div className="relative flex flex-col border border-gray-200 bg-white hover:border-gfc-500 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        {/* Top lime accent bar */}
        <div className="h-[3px] bg-gfc-lime" />

        <div className="p-6 flex flex-col flex-1">
          {/* Programme label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-gfc-lime rounded-full flex-shrink-0" />
            <p className="text-gfc-500 text-[9px] font-black uppercase tracking-widest">{programme}</p>
          </div>

          {/* Large watermark number */}
          <p className="text-gray-100 font-black select-none leading-none mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '72px' }}>
            {String(index + 1).padStart(2, '0')}
          </p>

          {/* Team name */}
          <h3 className="text-gray-900 font-black uppercase leading-tight mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(20px, 2vw, 26px)' }}>
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-400 text-xs leading-relaxed flex-1">{description}</p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <span className="text-gfc-500 text-[10px] font-black uppercase tracking-widest group-hover:text-gfc-900 transition-colors">
              View Squad
            </span>
            <div className="w-7 h-7 bg-gray-100 group-hover:bg-gfc-lime transition-colors duration-300 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-gray-400 group-hover:text-gfc-900 transition-colors" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Gallery lightbox (homepage) ───────────────────────── */
function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-gfc-lime transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          Close <span className="text-base leading-none">✕</span>
        </button>
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gfc-900">
          <img src={photo.image} alt={photo.title} className="max-h-[75vh] max-w-full object-contain" />
        </div>
        <div className="bg-gfc-900 border-t border-gfc-700 px-5 py-4">
          <p className="text-white font-black uppercase text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>{photo.title}</p>
          {photo.caption && <p className="text-gray-400 text-xs mt-1">{photo.caption}</p>}
        </div>
      </div>
    </div>
  )
}

/* ── Gallery glimpse (3×3 Instagram grid) ──────────────── */
function GalleryGlimpse({ photos }) {
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  if (!photos?.length) return null

  const gridPhotos = photos.slice(0, 9)

  return (
    <section className="bg-gfc-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-4">Behind the Scenes</p>
            <h2 className="text-white font-black uppercase" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}>
              Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 flex-shrink-0"
          >
            View All <span>→</span>
          </Link>
        </div>

        {/* 3×3 Instagram-style grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-[3px]">
          {gridPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative overflow-hidden bg-gfc-800 cursor-pointer group"
              style={{ aspectRatio: '1 / 1' }}
              onClick={() => setLightboxPhoto(photo)}
            >
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gfc-900/0 group-hover:bg-gfc-900/70 transition-colors duration-300 flex flex-col items-center justify-center gap-2 p-3">
                <div className="w-9 h-9 bg-gfc-lime scale-0 group-hover:scale-100 transition-transform duration-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gfc-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
                  </svg>
                </div>
                <p className="text-white text-[10px] font-black uppercase tracking-wider text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 hidden sm:block">
                  {photo.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-gfc-700" />
          <Link
            to="/gallery"
            className="bg-gfc-lime text-gfc-900 font-black px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-white transition-colors flex-shrink-0"
          >
            See Full Gallery
          </Link>
          <div className="flex-1 h-px bg-gfc-700" />
        </div>
      </div>

      {lightboxPhoto && (
        <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </section>
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
  const { data: galleryPhotos } = useQuery({ queryKey: ['gallery-home'], queryFn: () => getGallery('') })

  return (
    <div>
      <SEO
        title="Home"
        description="Official website of Hillyfielders Gorkha FC — grassroots football from the heart of Gorkha, Nepal. U-16 Girls team, Academy programme and senior teams coming soon."
      />

      {/* ── HERO ────────────────────────────────────────── */}
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

      {/* ── FIXTURES ────────────────────────────────────── */}
      <FixturesBand
        mensFixtures={mensFixtures}
        womensFixtures={womensFixtures}
        mensLoading={mensLoading}
        womensLoading={womensLoading}
      />

      {/* ── STATS STRIP ─────────────────────────────────── */}
      <section className="bg-gfc-lime">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <Stat number="2024" label="Year Founded" />
          <Stat number="500+" label="Facebook Followers" />
          <Stat number="U-16" label="Girls Team Active" />
          <Stat number="TOC" label="Home Turf, Gorkha" />
        </div>
      </section>

      {/* ── LATEST NEWS ─────────────────────────────────── */}
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

      {/* ── OUR PROGRAMMES ──────────────────────────────── */}
      {programmes.some(p => p.teams.length > 0) && (
        <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="eyebrow-light mb-4">The Club</p>
                <h2 className="text-gray-900 font-black uppercase" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                  Our Programmes
                </h2>
              </div>
              <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest hidden md:block">
                {programmes.reduce((n, p) => n + p.teams.length, 0)} Active {programmes.reduce((n, p) => n + p.teams.length, 0) === 1 ? 'Team' : 'Teams'}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {programmes
                .flatMap(programme =>
                  programme.teams.map(team => ({ ...team, programmeName: programme.name }))
                )
                .map((team, i) => (
                  <ProgrammeCard
                    key={team.slug}
                    programme={team.programmeName}
                    name={team.name}
                    to={`/${team.slug}/squad`}
                    description={team.description}
                    index={i}
                  />
                ))
              }
            </div>
          </div>
        </section>
      )}
      {/* ── HOME GROUND (minimal strip) ─────────────────── */}
      <section className="bg-gfc-800 border-y border-gfc-700 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Left: label + name */}
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="eyebrow">Our Ground</p>
            <span className="w-px h-6 bg-gfc-700 hidden sm:block flex-shrink-0" />
            <p className="text-white font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '26px' }}>
              TOC TURF
            </p>
            <p className="text-gray-500 text-sm hidden md:block">Gorkha, Nepal</p>
          </div>

          {/* Middle: facts */}
          <div className="flex items-center gap-5">
            {['5-a-side turf', 'Training ground', 'Home of Hillyfielders'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gfc-lime rounded-full flex-shrink-0" />
                <span className="text-gray-500 text-[11px] uppercase tracking-wide hidden sm:block">{item}</span>
              </div>
            ))}
          </div>

          {/* Right: location */}
          <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
            <span className="w-4 h-px bg-gfc-lime" />
            Gandaki Pradesh, Nepal
          </p>
        </div>
      </section>

      {/* ── GALLERY GLIMPSE ─────────────────────────────── */}
      <GalleryGlimpse photos={galleryPhotos} />


      {/* ── SPONSORS STRIP ──────────────────────────────── */}
      {/* {sponsors?.length > 0 && (
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
      )} */}

      {/* ── STAY CONNECTED (lime) ───────────────────────── */}
      <section className="bg-gfc-lime py-24 px-6 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden">
          <p className="text-gfc-900/[0.06] font-black uppercase leading-none pr-8" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(120px, 16vw, 200px)' }}>
            GFC
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-0.5 bg-gfc-900/30" />
            <p className="text-gfc-900/60 text-[11px] font-black uppercase tracking-widest">Stay Connected</p>
            <span className="w-8 h-0.5 bg-gfc-900/30" />
          </div>

          <h2 className="text-gfc-900 font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}>
            Follow the Journey
          </h2>
          <p className="text-gfc-900/55 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            From the hills of Gandaki Pradesh — follow Hillyfielders Gorkha FC for match updates, training photos, and club news.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://www.facebook.com/HillyFielders/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gfc-900 text-gfc-lime font-black px-8 py-4 text-xs uppercase tracking-widest hover:bg-gfc-700 transition-colors flex items-center gap-3"
            >
              Follow on Facebook
              <span className="bg-gfc-lime/10 text-gfc-lime text-[9px] font-black px-2 py-0.5 tracking-normal normal-case rounded-full whitespace-nowrap">
                507+ followers
              </span>
            </a>
            <Link
              to="/contact"
              className="border-2 border-gfc-900 text-gfc-900 font-bold px-8 py-4 text-xs uppercase tracking-widest hover:bg-gfc-900 hover:text-gfc-lime transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
