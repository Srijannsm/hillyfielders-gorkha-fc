import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Squad from './pages/Squad'
import Fixtures from './pages/Fixtures'
import { NewsList, ArticleDetail } from './pages/News'
import Sponsors from './pages/Sponsors'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import About from './pages/About'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'

function ComingSoon({ page }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gfc-900">
      <div className="text-center px-6">
        <img
          src="/logo.png"
          alt="GFC"
          className="h-20 w-20 object-contain mx-auto mb-8 opacity-20"
          onError={e => e.target.style.display = 'none'}
        />
        <p className="text-white font-black uppercase text-4xl mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {page}
        </p>
        <p className="text-gray-600 text-sm uppercase tracking-widest mb-8">Coming Soon</p>
        <Link to="/" className="bg-gfc-lime text-gfc-900 font-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Dynamic team routes */}
          <Route path="/:teamType/squad" element={<Squad />} />
          <Route path="/:teamType/fixtures" element={<Fixtures />} />
          <Route path="/:teamType/results" element={<Fixtures />} />

          {/* News */}
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:slug" element={<ArticleDetail />} />

          {/* Gallery */}
          <Route path="/gallery" element={<Gallery />} />

          {/* About */}
          <Route path="/about" element={<About />} />

          {/* Other pages */}
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/academy" element={<ComingSoon page="Academy Programme" />} />
          <Route path="/mens" element={<ComingSoon page="Men's Programme" />} />
          <Route path="/womens" element={<ComingSoon page="Women's Programme" />} />
        </Routes>
        </PageTransition>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}