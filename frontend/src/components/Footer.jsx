import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#1B4332] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Club info */}
        <div>
          <p className="text-[#BEFF00] font-bold text-lg mb-2">Hillyfielders Gorkha FC</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Based in Gorkha, Nepal. Home of the Hillyfielders.
            Representing our community with pride on and off the pitch.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-[#BEFF00] font-bold mb-3">Quick Links</p>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <Link to="/mens/squad" className="hover:text-[#BEFF00] transition-colors">Men's Squad</Link>
            <Link to="/womens/squad" className="hover:text-[#BEFF00] transition-colors">Women's Squad</Link>
            <Link to="/news" className="hover:text-[#BEFF00] transition-colors">Latest News</Link>
            <Link to="/sponsors" className="hover:text-[#BEFF00] transition-colors">Our Sponsors</Link>
            <Link to="/contact" className="hover:text-[#BEFF00] transition-colors">Contact Us</Link>
          </div>
        </div>

        {/* Social */}
        <div>
          <p className="text-[#BEFF00] font-bold mb-3">Follow Us</p>
          <div className="flex gap-4 text-sm text-gray-300">
            <a href="#" className="hover:text-[#BEFF00] transition-colors">Facebook</a>
            <a href="#" className="hover:text-[#BEFF00] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#BEFF00] transition-colors">YouTube</a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            © {new Date().getFullYear()} Hillyfielders Gorkha FC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}