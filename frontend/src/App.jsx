import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ErrorBoundary from './components/errors/ErrorBoundary'
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

// Admin
import { AuthProvider } from './admin/context/AuthContext'
import AdminLayout from './admin/layout/AdminLayout'
import Login from './admin/pages/Login'
import Dashboard from './admin/pages/Dashboard'
import Players from './admin/pages/Players'
import Teams from './admin/pages/Teams'
import AdminFixtures from './admin/pages/Fixtures'
import News from './admin/pages/News'
import AdminGallery from './admin/pages/Gallery'
import AdminSponsors from './admin/pages/Sponsors'
import ClubProfile from './admin/pages/ClubProfile'

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

function PublicSite() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:teamType/squad" element={<ErrorBoundary><Squad /></ErrorBoundary>} />
            <Route path="/:teamType/fixtures" element={<ErrorBoundary><Fixtures /></ErrorBoundary>} />
            <Route path="/:teamType/results" element={<ErrorBoundary><Fixtures /></ErrorBoundary>} />
            <Route path="/news" element={<ErrorBoundary><NewsList /></ErrorBoundary>} />
            <Route path="/news/:slug" element={<ErrorBoundary><ArticleDetail /></ErrorBoundary>} />
            <Route path="/gallery" element={<ErrorBoundary><Gallery /></ErrorBoundary>} />
            <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin panel — no Navbar/Footer */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="players"  element={<Players />} />
          <Route path="teams"    element={<Teams />} />
          <Route path="fixtures" element={<AdminFixtures />} />
          <Route path="news"     element={<News />} />
          <Route path="gallery"  element={<AdminGallery />} />
          <Route path="sponsors" element={<AdminSponsors />} />
          <Route path="club"     element={<ClubProfile />} />
        </Route>

        {/* Public site — has Navbar/Footer */}
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </AuthProvider>
  )
}
