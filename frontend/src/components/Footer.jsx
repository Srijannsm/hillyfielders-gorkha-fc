import { Link } from 'react-router-dom'

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

function FooterHeading({ children }) {
  return (
    <p className="text-white font-black uppercase text-[10px] tracking-widest mb-5 flex items-center gap-3">
      <span className="w-4 h-0.5 bg-gfc-lime flex-shrink-0" />
      {children}
    </p>
  )
}

export default function Footer() {
  return (
    <footer className="bg-gfc-900">

      {/* Sponsor CTA bar */}
      <div className="bg-white border-t border-gray-100 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">
            Support Hillyfielders Gorkha FC · Become a club partner
          </p>
          <Link
            to="/sponsors"
            className="text-gfc-lime text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 flex-shrink-0"
          >
            View Sponsors <span>→</span>
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="border-t border-gfc-700 max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

        {/* Club identity — spans 2 cols on lg */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/logo.png"
              alt="Gorkha FC"
              className="h-12 w-12 object-contain flex-shrink-0"
              onError={e => e.target.style.display = 'none'}
            />
            <div className="leading-none">
              <p className="text-gfc-lime text-[9px] font-black uppercase tracking-widest mb-1">Hillyfielders</p>
              <p className="text-white font-black uppercase" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px' }}>
                Gorkha FC
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs mb-7">
            Grassroots football club based in Gorkha, Gandaki Pradesh, Nepal.
            Building the next generation of Nepali footballers.
          </p>
          <div className="flex gap-2">
            {[
              { label: 'FB', href: 'https://www.facebook.com/HillyFielders/' },
              { label: 'IG', href: '#' },
              { label: 'YT', href: '#' },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target={s.href !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="w-9 h-9 border border-gfc-700 hover:border-gfc-lime hover:text-gfc-lime text-gray-500 text-[10px] font-black flex items-center justify-center uppercase tracking-wider transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Men's teams */}
        <div>
          <FooterHeading>Men's</FooterHeading>
          <div className="flex flex-col gap-2.5">
            {MENS_TEAMS.map(t => (
              <Link key={t.slug} to={`/${t.slug}/squad`} className="text-gray-600 text-sm hover:text-gfc-lime transition-colors font-medium">
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Women's teams */}
        <div>
          <FooterHeading>Women's</FooterHeading>
          <div className="flex flex-col gap-2.5">
            {WOMENS_TEAMS.map(t => (
              <Link key={t.slug} to={`/${t.slug}/squad`} className="text-gray-600 text-sm hover:text-gfc-lime transition-colors font-medium">
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Club info */}
        <div>
          <FooterHeading>Club</FooterHeading>
          <div className="flex flex-col gap-2.5 mb-8">
            {[
              { label: 'Latest News',  to: '/news' },
              { label: 'Sponsors',     to: '/sponsors' },
              { label: 'Academy',      to: '/academy' },
              { label: 'Contact Us',   to: '/contact' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="text-gray-600 text-sm hover:text-gfc-lime transition-colors font-medium">
                {l.label}
              </Link>
            ))}
          </div>

          <FooterHeading>Ground</FooterHeading>
          <p className="text-gray-600 text-sm leading-relaxed">
            TOC Turf<br />
            Gorkha, Gandaki Pradesh<br />
            Nepal
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gfc-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-gray-700 uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} Hillyfielders Gorkha FC. All rights reserved.</p>
          <p>Est. 2024 · Gorkha, Nepal · TOC Turf</p>
        </div>
      </div>
    </footer>
  )
}
