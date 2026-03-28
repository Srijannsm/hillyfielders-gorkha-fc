import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-[#BEFF00] font-semibold'
      : 'text-white hover:text-[#BEFF00] transition-colors'

  return (
    <nav className="bg-[#1B4332] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + Club name */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Gorkha FC"
            className="h-12 w-12 object-contain"
            onError={e => e.target.style.display = 'none'}
          />
          <div>
            <p className="text-[#BEFF00] text-xs font-semibold tracking-widest uppercase">
              Hillyfielders
            </p>
            <p className="text-white text-lg font-bold leading-tight">
              Gorkha FC
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={linkClass}>Home</NavLink>

          {/* Men's dropdown */}
          <div className="relative group">
            <button className="text-white hover:text-[#BEFF00] transition-colors">
              Men's ▾
            </button>
            <div className="absolute top-full left-0 bg-[#1B4332] border border-[#2D6A4F] rounded-lg py-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
              <NavLink to="/mens/squad" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Squad</NavLink>
              <NavLink to="/mens/fixtures" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Fixtures</NavLink>
              <NavLink to="/mens/results" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Results</NavLink>
            </div>
          </div>

          {/* Women's dropdown */}
          <div className="relative group">
            <button className="text-white hover:text-[#BEFF00] transition-colors">
              Women's ▾
            </button>
            <div className="absolute top-full left-0 bg-[#1B4332] border border-[#2D6A4F] rounded-lg py-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl">
              <NavLink to="/womens/squad" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Squad</NavLink>
              <NavLink to="/womens/fixtures" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Fixtures</NavLink>
              <NavLink to="/womens/results" className="block px-4 py-2 text-white hover:text-[#BEFF00] hover:bg-[#2D6A4F] text-sm">Results</NavLink>
            </div>
          </div>

          <NavLink to="/news" className={linkClass}>News</NavLink>
          <NavLink to="/sponsors" className={linkClass}>Sponsors</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#2D6A4F] px-4 py-4 flex flex-col gap-4">
          <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/mens/squad" className={linkClass} onClick={() => setMenuOpen(false)}>Men's Squad</NavLink>
          <NavLink to="/mens/fixtures" className={linkClass} onClick={() => setMenuOpen(false)}>Men's Fixtures</NavLink>
          <NavLink to="/womens/squad" className={linkClass} onClick={() => setMenuOpen(false)}>Women's Squad</NavLink>
          <NavLink to="/womens/fixtures" className={linkClass} onClick={() => setMenuOpen(false)}>Women's Fixtures</NavLink>
          <NavLink to="/news" className={linkClass} onClick={() => setMenuOpen(false)}>News</NavLink>
          <NavLink to="/sponsors" className={linkClass} onClick={() => setMenuOpen(false)}>Sponsors</NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </div>
      )}
    </nav>
  )
}