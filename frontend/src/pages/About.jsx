import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getClubProfile } from '../services/api'
import SEO from '../components/SEO'

/* ── Loading skeleton ───────────────────────────────────── */
function Loading() {
  return (
    <div className="min-h-screen bg-gfc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gfc-lime font-black text-3xl animate-pulse mb-2">GFC</div>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )
}

/* ── Stat card (used in Our Story section) ──────────────── */
function StatCard({ label, value }) {
  return (
    <div className="border border-gfc-700 bg-gfc-800 p-6">
      <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
      <p className="text-white font-black uppercase leading-tight" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '22px' }}>
        {value}
      </p>
    </div>
  )
}

/* ── Mission/Vision/Values card ─────────────────────────── */
function PillarCard({ icon, heading, body }) {
  return (
    <div className="border border-gfc-700 bg-gfc-800 p-8 flex flex-col gap-4">
      <div className="w-10 h-10 bg-gfc-lime flex items-center justify-center flex-shrink-0">
        <span className="text-gfc-900 text-lg">{icon}</span>
      </div>
      <h3 className="text-white font-black uppercase text-lg" style={{ fontFamily: 'Oswald, sans-serif' }}>
        {heading}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

/* ── Programme list card ─────────────────────────────────── */
function ProgrammeCard({ heading, accent, items }) {
  return (
    <div className="bg-white border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-2 h-6 ${accent}`} />
        <h3 className="text-gray-900 font-black uppercase text-base" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {heading}
        </h3>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
            <span className="w-1.5 h-1.5 bg-gfc-700 rounded-full flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── About page ─────────────────────────────────────────── */
export default function About() {
  const { data: club, isLoading, isError } = useQuery({
    queryKey: ['club-profile'],
    queryFn: getClubProfile,
  })

  if (isLoading) return <Loading />

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center bg-gfc-900">
      <p className="text-red-400 text-sm">Failed to load club profile.</p>
    </div>
  )

  return (
    <div>
      <SEO
        title="About the Club"
        description="Learn about Hillyfielders Gorkha FC — founded in 2024, based at TOC Turf in Gorkha, Gandaki Pradesh. Our story, mission, vision and values."
      />

      {/* ── SECTION 1: Page header ── */}
      <section className="section-bg bg-gfc-900 text-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">{club.tagline || 'Hillyfielders Gorkha FC'}</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            About the Club
          </h1>
          <p className="text-gray-400 text-sm mt-4 max-w-md">
            A grassroots football club built in Gorkha, for Gorkha.
          </p>
        </div>
      </section>

      {/* ── SECTION 2: Our Story ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Text column */}
          <div className="lg:col-span-3">
            <p className="eyebrow-light mb-5">Our Story</p>
            <h2 className="text-gray-900 font-black uppercase leading-tight mb-8"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)' }}>
              {club.our_story_heading}
            </h2>
            <div className="flex flex-col gap-5">
              {club.our_story_body.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-500 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          </div>

          {/* Stats column */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <StatCard label="Established" value={club.founded_year} />
            <StatCard label="Home Ground" value={club.home_ground} />
            <StatCard label="District" value={club.district} />
            <StatCard label="Province" value={club.province} />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Mission / Vision / Values ── */}
      <section className="bg-gfc-900 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-5" style={{ justifyContent: 'center' }}>Our Purpose</p>
            <h2 className="text-white font-black uppercase leading-tight"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)' }}>
              Mission, Vision &amp; Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PillarCard icon="⚽" heading="Our Mission" body={club.mission} />
            <PillarCard icon="🏆" heading="Our Vision"  body={club.vision} />
            <PillarCard icon="🤝" heading="Our Values"  body={club.values} />
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Current Programmes ── */}
      <section className="px-6 py-20" style={{ backgroundColor: '#BEFF00' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-gfc-900/60 text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-7 h-0.5 bg-gfc-900/40 inline-block" />
              Building from the ground up
            </p>
            <h2 className="text-gfc-900 font-black uppercase leading-tight mb-6"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)' }}>
              {club.programmes_heading}
            </h2>
            <div className="max-w-3xl flex flex-col gap-4">
              {club.programmes_body.split('\n\n').map((para, i) => (
                <p key={i} className="text-gfc-900/70 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <ProgrammeCard
              heading="Active Now"
              accent="bg-gfc-700"
              items={club.active_programmes_list}
            />
            <ProgrammeCard
              heading="Coming Soon"
              accent="bg-gray-300"
              items={club.coming_soon_list}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Home Ground ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Text column */}
          <div className="lg:col-span-3">
            <p className="eyebrow-light mb-5">Home Ground</p>
            <h2 className="text-gray-900 font-black uppercase leading-tight mb-8"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px, 3vw, 44px)' }}>
              Our Home —<br />TOC Turf
            </h2>
            <div className="flex flex-col gap-5">
              {club.ground_story.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-500 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          </div>

          {/* Ground details card */}
          <div className="lg:col-span-2">
            <div className="bg-gfc-900 p-8">
              <p className="eyebrow mb-6">Ground Details</p>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Location', value: `${club.district}, ${club.province}` },
                  { label: 'Type',     value: '5-a-side turf' },
                  { label: 'Used for', value: 'Training, Academy sessions, U-16 matches' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-gfc-700 pb-5 last:border-b-0 last:pb-0">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: Join the journey CTA ── */}
      <section className="bg-gfc-900 px-6 py-24 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/logo.png" alt="" className="w-72 h-72 object-contain opacity-[0.04]"
            onError={e => e.target.style.display = 'none'} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-6" style={{ justifyContent: 'center' }}>Get Involved</p>
          <h2 className="text-white font-black uppercase leading-tight mb-6"
            style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Be Part of<br /><span className="text-gfc-lime">the Story</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
            Whether you are a player, a supporter, a sponsor or simply someone who loves football —
            Hillyfielders Gorkha FC welcomes you. Follow us on Facebook, get in touch, and be part
            of something special from the very beginning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {club.facebook_url && (
              <a
                href={club.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gfc-lime text-gfc-900 font-black px-8 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors inline-block"
              >
                Follow on Facebook
              </a>
            )}
            <Link
              to="/contact"
              className="border border-gfc-700 text-white font-black px-8 py-4 text-xs uppercase tracking-widest hover:border-gfc-lime hover:text-gfc-lime transition-colors inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
