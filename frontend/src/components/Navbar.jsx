import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const MENS_TEAMS = [
  { label: 'Senior Team', slug: 'mens-senior' },
  { label: 'U-16 Boys',   slug: 'mens-u16' },
  { label: 'U-14 Boys',   slug: 'mens-u14' },
  { label: 'U-12 Boys',   slug: 'mens-u12' },
]

const WOMENS_TEAMS = [
  { label: 'Senior Team', slug: 'womens-senior' },
  { label: 'U-16 Girls',  slug: 'womens-u16' },
  { label: 'U-14 Girls',  slug: 'womens-u14' },
  { label: 'U-12 Girls',  slug: 'womens-u12' },
]

function TeamsMegaMenu() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[440px] bg-gfc-900 border border-gfc-700 border-t-2 border-t-gfc-lime shadow-2xl nav-dropdown z-50">
      <div className="grid grid-cols-2 divide-x divide-gfc-700">

        {/* Men's column */}
        <div>
          <div className="px-5 py-2.5 bg-gfc-800 border-b border-gfc-700">
            <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">Men's Programme</p>
          </div>
          {MENS_TEAMS.map(team => (
            <Link
              key={team.slug}
              to={`/${team.slug}/squad`}
              className="flex items-center gap-3 px-5 py-3 text-gray-400 hover:text-white hover:bg-gfc-800 text-sm font-medium transition-colors border-b border-gfc-700 last:border-b-0"
            >
              <span className="w-1 h-1 bg-gfc-lime rounded-full flex-shrink-0" />
              {team.label}
            </Link>
          ))}
        </div>

        {/* Women's column */}
        <div>
          <div className="px-5 py-2.5 bg-gfc-800 border-b border-gfc-700">
            <p className="text-gfc-lime text-[10px] font-black uppercase tracking-widest">Women's Programme</p>
          </div>
          {WOMENS_TEAMS.map(team => (
            <Link
              key={team.slug}
              to={`/${team.slug}/squad`}
              className="flex items-center gap-3 px-5 py-3 text-gray-400 hover:text-white hover:bg-gfc-800 text-sm font-medium transition-colors border-b border-gfc-700 last:border-b-0"
            >
              <span className="w-1 h-1 bg-gfc-lime rounded-full flex-shrink-0" />
              {team.label}
            </Link>
          ))}
        </div>
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false)
  const [mobileGender, setMobileGender] = useState(null)

  const close = () => setMenuOpen(false)

  return (
    <nav className="bg-gfc-800 sticky top-0 z-50 shadow-lg">
      {/* Top info bar */}
      <div className="bg-gfc-900 border-b border-gfc-700 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">
            Official Website · Hillyfielders Gorkha FC · Gorkha, Nepal
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/HillyFielders/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Facebook
            </a>
            <span className="text-gfc-700 text-xs">·</span>
            <a href="#" className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors">
              Instagram
            </a>
            <span className="text-gfc-700 text-xs">·</span>
            <a href="#" className="text-gray-500 hover:text-gfc-lime text-[10px] font-bold uppercase tracking-widest transition-colors">
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="max-w-7xl mx-auto px-6 flex items-stretch justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 py-3 flex-shrink-0">
          <img
            src="/logo.png"
            alt="Gorkha FC"
            className="h-12 w-12 object-contain"
            onError={e => e.target.style.display = 'none'}
          />
          <div className="leading-none">
            <p className="text-gfc-lime text-[9px] font-black uppercase tracking-widest mb-0.5">
              Hillyfielders
            </p>
            <p className="text-white font-black uppercase tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px' }}>
              Gorkha FC
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-stretch gap-0.5">

          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about"    className={navLinkClass}>About</NavLink>

          {/* OUR TEAMS mega-menu */}
          <div className="relative nav-item flex items-stretch">
            <button className="flex items-center gap-1.5 px-4 text-xs font-black tracking-widest uppercase text-gray-300 hover:text-white border-b-2 border-transparent hover:border-gfc-lime transition-colors">
              Our Teams
              <svg className="w-2.5 h-2.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <TeamsMegaMenu />
          </div>

          <NavLink to="/news"     className={navLinkClass}>News</NavLink>
          <NavLink to="/gallery"  className={navLinkClass}>Gallery</NavLink>
          <NavLink to="/sponsors" className={navLinkClass}>Sponsors</NavLink>
          <NavLink to="/contact"  className={navLinkClass}>Contact</NavLink>

          <div className="flex items-center my-3 ml-3">
            <Link
              to="/academy"
              className="bg-gfc-lime text-gfc-900 text-[10px] font-black px-4 py-2 tracking-widest uppercase hover:bg-white transition-colors"
            >
              Academy
            </Link>
          </div>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white py-3 px-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
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
          <Link to="/" className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>
            Home
          </Link>
          <Link to="/about" className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>About</Link>

          {/* OUR TEAMS accordion */}
          <div>
            <button
              className="w-full text-left px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime flex justify-between items-center transition-colors"
              onClick={() => { setMobileTeamsOpen(!mobileTeamsOpen); setMobileGender(null) }}
            >
              Our Teams
              <svg className={`w-3 h-3 transition-transform ${mobileTeamsOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {mobileTeamsOpen && (
              <div className="bg-gfc-800">
                {/* Men's sub-accordion */}
                <button
                  className="w-full text-left px-8 py-3 text-gray-300 text-xs font-bold uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime flex justify-between items-center transition-colors"
                  onClick={() => setMobileGender(mobileGender === 'mens' ? null : 'mens')}
                >
                  Men's Programme
                  <svg className={`w-3 h-3 transition-transform ${mobileGender === 'mens' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {mobileGender === 'mens' && MENS_TEAMS.map(team => (
                  <Link
                    key={team.slug}
                    to={`/${team.slug}/squad`}
                    className="flex items-center gap-3 px-10 py-3 text-gray-400 text-xs hover:text-gfc-lime border-b border-gfc-700 transition-colors"
                    onClick={close}
                  >
                    <span className="w-1 h-1 bg-gfc-lime rounded-full" />
                    {team.label}
                  </Link>
                ))}

                {/* Women's sub-accordion */}
                <button
                  className="w-full text-left px-8 py-3 text-gray-300 text-xs font-bold uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime flex justify-between items-center transition-colors"
                  onClick={() => setMobileGender(mobileGender === 'womens' ? null : 'womens')}
                >
                  Women's Programme
                  <svg className={`w-3 h-3 transition-transform ${mobileGender === 'womens' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {mobileGender === 'womens' && WOMENS_TEAMS.map(team => (
                  <Link
                    key={team.slug}
                    to={`/${team.slug}/squad`}
                    className="flex items-center gap-3 px-10 py-3 text-gray-400 text-xs hover:text-gfc-lime border-b border-gfc-700 transition-colors"
                    onClick={close}
                  >
                    <span className="w-1 h-1 bg-gfc-lime rounded-full" />
                    {team.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/news"     className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>News</Link>
          <Link to="/gallery"  className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>Gallery</Link>
          <Link to="/sponsors" className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>Sponsors</Link>
          <Link to="/contact"  className="block px-6 py-3.5 text-white text-xs font-black uppercase tracking-widest border-b border-gfc-700 hover:text-gfc-lime transition-colors" onClick={close}>Contact</Link>
          <Link to="/academy"  className="block px-6 py-3.5 text-gfc-lime text-xs font-black uppercase tracking-widest" onClick={close}>Academy →</Link>
        </div>
      )}
    </nav>
  )
}
