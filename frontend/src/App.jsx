import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Squad from './pages/Squad'
import Fixtures from './pages/Fixtures'
import { NewsList, ArticleDetail } from './pages/News'
import Sponsors from './pages/Sponsors'
import Contact from './pages/Contact'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:teamType/squad" element={<Squad />} />
          <Route path="/:teamType/fixtures" element={<Fixtures />} />
          <Route path="/:teamType/results" element={<Fixtures />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:slug" element={<ArticleDetail />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}