import { lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ErrorBoundary from './components/errors/ErrorBoundary'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './admin/context/AuthContext'

// Public pages — code-split per route
const Home          = lazy(() => import('./pages/Home'))
const Squad         = lazy(() => import('./pages/Squad'))
const Fixtures      = lazy(() => import('./pages/Fixtures'))
const NewsList      = lazy(() => import('./pages/News').then(m => ({ default: m.NewsList })))
const ArticleDetail = lazy(() => import('./pages/News').then(m => ({ default: m.ArticleDetail })))
const Sponsors      = lazy(() => import('./pages/Sponsors'))
const Contact       = lazy(() => import('./pages/Contact'))
const Gallery       = lazy(() => import('./pages/Gallery'))
const About         = lazy(() => import('./pages/About'))

// Admin area — separate chunk, only loaded when /admin is visited
const AdminLayout    = lazy(() => import('./admin/layout/AdminLayout'))
const Login          = lazy(() => import('./admin/pages/Login'))
const Dashboard      = lazy(() => import('./admin/pages/Dashboard'))
const Players        = lazy(() => import('./admin/pages/Players'))
const Teams          = lazy(() => import('./admin/pages/Teams'))
const AdminFixtures  = lazy(() => import('./admin/pages/Fixtures'))
const News           = lazy(() => import('./admin/pages/News'))
const AdminGallery   = lazy(() => import('./admin/pages/Gallery'))
const AdminSponsors  = lazy(() => import('./admin/pages/Sponsors'))
const ClubProfile    = lazy(() => import('./admin/pages/ClubProfile'))
const Enquiries      = lazy(() => import('./admin/pages/Enquiries'))
const AdminProfile   = lazy(() => import('./admin/pages/Profile'))

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
          <Suspense fallback={null}>
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
          </Suspense>
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
      <Suspense fallback={null}>
        <Routes>
          {/* Admin panel — no Navbar/Footer */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="players"  element={<Players />} />
            <Route path="teams"    element={<Teams />} />
            <Route path="fixtures" element={<AdminFixtures />} />
            <Route path="news"     element={<News />} />
            <Route path="gallery"    element={<AdminGallery />} />
            <Route path="sponsors"  element={<AdminSponsors />} />
            <Route path="club"      element={<ClubProfile />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="profile"   element={<AdminProfile />} />
          </Route>

          {/* Public site — has Navbar/Footer */}
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
