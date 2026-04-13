import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gfc-900 px-6">
      <SEO title="Page Not Found" />
      <div className="text-center">
        <img
          src="/logo.png"
          alt="Hillyfielders Gorkha FC"
          className="h-20 w-20 object-contain mx-auto mb-8 opacity-20"
          onError={e => { e.target.style.display = 'none' }}
        />
        <p className="text-gfc-lime font-black uppercase text-7xl mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
          404
        </p>
        <p className="text-white font-black uppercase text-2xl mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Page Not Found
        </p>
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-10">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-gfc-lime text-gfc-900 font-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
