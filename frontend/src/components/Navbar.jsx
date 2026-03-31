import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProgrammes } from '../services/api'

/* ── Two-panel fly-out dropdown ─────────────────────────── */
function TeamsDropdown({ programmes, activeProgramme, onProgrammeHover, onClose }) {
  if (!programmes?.length) return null

  return (
    <div className="absolute top-full left-0 mt-0 shadow-2xl z-50 border-t-2 border-t-gfc-lime">
      <div className="bg-gfc-900 w-44">
        {programmes.map(p => {
          const label = p.name.replace(/\s*programme$/i, '').trim()
          const isActive = activeProgramme === p.id

          return (
            <div
              key={p.id}
              onMouseEnter={() => onProgrammeHover(p.id)}
              className={`relative flex items-center justify-between px-5 py-4 cursor-default select-none transition-colors border-b border-gfc-700/40 last:border-b-0 ${
                isActive ? 'bg-gfc-800 text-gfc-lime' : 'text-gray-400 hover:text-white hover:bg-gfc-800/50'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
              <svg
                className={`w-3 h-3 flex-shrink-0 transition-colors ${isActive ? 'text-gfc-lime' : 'text-gfc-700'}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>

              {/* Fly-out — anchored to this row, never adds height to left panel */}
              {isActive && p.teams.length > 0 && (
                <div className="absolute left-full top-0 bg-gfc-800 border-l border-t border-gfc-700 w-52 z-50">
                  {p.teams.map(team => (
                    <Link
                      key={team.slug}
                      to={`/${team.slug}/squad`}
                      onClick={onClose}
                      className="group flex items-center justify-between gap-2 px-5 py-3.5 text-gray-300 hover:text-gfc-lime hover:bg-gfc-700/30 transition-colors border-b border-gfc-700/40 last:border-b-0"
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">{team.name}</span>
                      <svg
                        className="w-3 h-3 text-gfc-700 group-hover:text-gfc-lime transition-colors flex-shrink-0"
                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navLinkClass = ({ isActive }) =>
  `flex items-center px-4 text-xs font-black tracking-widest border-b-2 transition-colors uppercase ${
    isActive
      ? 'text-gfc-lime border-gfc-lime'
      : 'text-gray-300 hover:text-white border-transparent hover:border-gfc-lime'
  }`

export default function Navbar() {
  const [menuOpen, setMenuOpen]           = useState(false)
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false)
  const [openProgramme, setOpenProgramme] = useState(null)

  /* Desktop dropdown state */
  const [teamsOpen, setTeamsOpen]           = useState(false)
  const [activeProgramme, setActiveProgramme] = useState(null)
  const teamsRef = useRef(null)

  /* Hide-on-scroll */
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const navRef = useRef(null)

  // Set --navbar-height once on mount so sticky children can offset correctly
  useEffect(() => {
    if (!navRef.current) return
    const h = navRef.current.getBoundingClientRect().height
    document.documentElement.style.setProperty('--navbar-height', `${h}px`)
    document.documentElement.style.setProperty('--nav-offset', `${h}px`)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--nav-offset',
      visible ? 'var(--navbar-height, 72px)' : '0px'
    )
  }, [visible])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY < 80) {
        setVisible(true)
      } else if (currentY > lastScrollY.current) {
        setVisible(false)
      } else {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const close = () => { setMenuOpen(false); setMobileTeamsOpen(false); setOpenProgramme(null) }

  const { data: programmes = [] } = useQuery({
    queryKey: ['programmes'],
    queryFn: getProgrammes,
    staleTime: 5 * 60 * 1000,
  })

  /* Close desktop dropdown on outside click */
  useEffect(() => {
    if (!teamsOpen) return
    const handler = (e) => {
      if (teamsRef.current && !teamsRef.current.contains(e.target)) {
        setTeamsOpen(false)
        setActiveProgramme(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [teamsOpen])

  const openTeams = () => {
    setTeamsOpen(true)
    if (programmes.length > 0) setActiveProgramme(programmes[0].id)
  }

  const closeTeams = () => {
    setTeamsOpen(false)
    setActiveProgramme(null)
  }

  return (
    <nav ref={navRef} className={`bg-gfc-800 sticky top-0 z-50 shadow-lg transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>

      {/* Top info bar */}
      <div className="bg-gfc-900 border-b border-gfc-700 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">
            Official Website · Hillyfielders Gorkha FC · Gorkha, Nepal
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/HillyFielders/" target="_blank" rel="noopener noreferrer"
              className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors">
              Facebook
            </a>
            <span className="text-gfc-700 text-xs">·</span>
            <a href="#" className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors">Instagram</a>
            <span className="text-gfc-700 text-xs">·</span>
            <a href="#" className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors">YouTube</a>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="max-w-7xl mx-auto px-6 flex items-stretch justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 py-3 flex-shrink-0">
          <img src="/logo.png" alt="Gorkha FC" className="h-12 w-12 object-contain"
            onError={e => e.target.style.display = 'none'} />
          <div className="leading-none">
            <p className="text-gfc-lime text-[9px] font-black uppercase tracking-widest mb-0.5">Hillyfielders</p>
            <p className="text-white font-black uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px' }}>
              Gorkha FC
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-stretch gap-0.5">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>

          {/* OUR TEAMS — click to open, hover to fly-out */}
          <div ref={teamsRef} className="relative flex items-stretch">
            <button
              onClick={() => teamsOpen ? closeTeams() : openTeams()}
              className={`flex items-center gap-1.5 px-4 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
                teamsOpen
                  ? 'text-gfc-lime border-gfc-lime'
                  : 'text-gray-300 hover:text-white border-transparent hover:border-gfc-lime'
              }`}
            >
              Our Teams
              <svg className={`w-2.5 h-2.5 mt-0.5 transition-transform duration-200 ${teamsOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {teamsOpen && (
              <TeamsDropdown
                programmes={programmes}
                activeProgramme={activeProgramme}
                onProgrammeHover={setActiveProgramme}
                onClose={closeTeams}
              />
            )}
          </div>

          <NavLink to="/news"     className={navLinkClass}>News</NavLink>
          <NavLink to="/gallery"  className={navLinkClass}>Gallery</NavLink>
          <NavLink to="/sponsors" className={navLinkClass}>Sponsors</NavLink>

          <div className="flex items-center my-3 ml-3">
            <Link to="/contact" className="bg-gfc-lime text-gfc-900 text-[10px] font-black px-4 py-2 tracking-widest uppercase hover:bg-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden text-white py-3 px-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <div className="flex flex-col gap-1.5 w-6">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gfc-900 border-t border-gfc-700">
          <Link to="/" onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">Home</Link>
          <Link to="/about" onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">About</Link>

          {/* OUR TEAMS accordion */}
          <div>
            <button
              className="w-full text-left px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime flex justify-between items-center transition-colors"
              onClick={() => { setMobileTeamsOpen(!mobileTeamsOpen); setOpenProgramme(null) }}
            >
              Our Teams
              <svg className={`w-3 h-3 transition-transform ${mobileTeamsOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {mobileTeamsOpen && (
              <div className="border-b border-gfc-700">
                {programmes.map(programme => (
                  <div key={programme.id}>
                    {/* Programme accordion toggle */}
                    <button
                      onClick={() => setOpenProgramme(openProgramme === programme.id ? null : programme.id)}
                      className={`w-full flex items-center justify-between px-6 py-3 text-[11px] font-black uppercase tracking-widest border-b border-gfc-700/50 transition-colors ${
                        openProgramme === programme.id ? 'text-gfc-lime bg-gfc-800' : 'text-gray-400 bg-gfc-800/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${openProgramme === programme.id ? 'bg-gfc-lime' : 'bg-gfc-700'}`} />
                        {programme.name}
                      </div>
                      <svg className={`w-3 h-3 transition-transform ${openProgramme === programme.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {openProgramme === programme.id && (
                      <div className="bg-gfc-900">
                        {programme.teams.map(team => (
                          <Link
                            key={team.slug}
                            to={`/${team.slug}/squad`}
                            onClick={close}
                            className="flex items-center justify-between gap-2 px-8 py-3 text-gray-400 hover:text-gfc-lime text-[11px] font-black uppercase tracking-widest border-b border-gfc-700/30 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-px bg-gfc-700" />
                              {team.name}
                            </div>
                            <svg className="w-3 h-3 text-gfc-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/news"     onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">News</Link>
          <Link to="/gallery"  onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">Gallery</Link>
          <Link to="/sponsors" onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">Sponsors</Link>
          <Link to="/contact"  onClick={close} className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors">Contact</Link>
          <Link to="/academy"  onClick={close} className="block px-6 py-3.5 text-gfc-lime text-xs font-black uppercase tracking-widest">Academy →</Link>
        </div>
      )}
    </nav>
  )
}
