import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import SEO from '../components/SEO'
import GallerySkeleton from '../components/skeletons/GallerySkeleton'
import ErrorMessage from '../components/errors/ErrorMessage'
import LazyImage from '../components/LazyImage'
import Lightbox from '../components/Lightbox'

/* ── Category filter config ─────────────────────────────── */
const TABS = [
  { label: 'All',        value: '' },
  { label: 'Training',   value: 'training' },
  { label: 'Match Day',  value: 'matchday' },
  { label: 'Academy',    value: 'academy' },
  { label: 'Team Photo', value: 'team' },
]

const BADGE_COLORS = {
  training: 'bg-blue-900/80 text-blue-200',
  matchday:  'bg-gfc-700/80 text-gfc-lime',
  academy:   'bg-purple-900/80 text-purple-200',
  team:      'bg-gfc-800/80 text-white',
}

/* ── Photo card ─────────────────────────────────────────── */
function PhotoCard({ photo, index, priority, onOpen }) {
  return (
    <div
      className="relative group cursor-pointer overflow-hidden bg-gfc-800 mb-3 break-inside-avoid"
      onClick={() => onOpen(index)}
    >
      {/* Lazy-loaded image with blur-up placeholder */}
      <LazyImage
        src={photo.image}
        thumbnail={photo.thumbnail}
        width={photo.width}
        height={photo.height}
        alt={photo.alt || photo.title}
        priority={priority}
        className="group-hover:scale-105 transition-transform duration-500"
      />

      {/* Category badge — always visible */}
      <span className={`absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${BADGE_COLORS[photo.category] || 'bg-gfc-700 text-white'}`}>
        {photo.category_display}
      </span>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-5 z-20">
        <p className="text-white font-black uppercase text-center text-base leading-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {photo.title}
        </p>
        <div className="w-8 h-0.5 bg-gfc-lime my-3" />
        <div className="w-8 h-8 bg-gfc-lime flex items-center justify-center mt-1">
          <svg className="w-3.5 h-3.5 text-gfc-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ── Gallery page ───────────────────────────────────────── */
export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('')
  const [lightboxIndex,  setLightboxIndex]  = useState(null)

  const { data: allPhotos, loading, error, errorType, retry } = useFetch('/api/gallery/')

  // Client-side category filter
  const photos = activeCategory
    ? allPhotos?.filter(p => p.category === activeCategory)
    : allPhotos

  // Count per category for tab badges
  const counts = allPhotos?.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {}) ?? {}

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Gallery"
        description="Photos from training sessions, match days and academy programmes at Hillyfielders Gorkha FC."
      />

      {/* ── Page header ── */}
      <section className="section-bg bg-gfc-900 text-white pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">Hillyfielders Gorkha FC</p>
          <h1 className="font-black uppercase leading-none text-white" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            Gallery
          </h1>
          <p className="text-gray-400 text-sm mt-4 max-w-md">
            Photos from training sessions, matchdays, academy programmes, and club events.
          </p>
        </div>
      </section>

      {/* ── Filter tabs — sticky, tracks navbar via --nav-offset CSS var ── */}
      <div
        className="bg-white border-b border-gray-200 sticky z-40"
        style={{ top: 'var(--nav-offset, 0px)', transition: 'top 300ms ease-in-out' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-stretch gap-0 overflow-x-auto no-scrollbar">
            {TABS.map(tab => {
              const count = tab.value === '' ? allPhotos?.length : counts[tab.value]
              const isActive = activeCategory === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveCategory(tab.value)}
                  className={`flex-shrink-0 px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'text-gfc-700 border-gfc-lime'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-200'
                  }`}
                >
                  {tab.label}
                  {count != null && count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm leading-none ${
                      isActive ? 'bg-gfc-lime text-gfc-900' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Masonry grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {loading ? (
          <GallerySkeleton count={8} />
        ) : error ? (
          <ErrorMessage type={errorType} message={error} onRetry={retry} context="gallery" />
        ) : !photos?.length ? (
          <ErrorMessage type="empty" context="gallery" />
        ) : (
          <>
            {/* Photo count */}
            <p className="text-gray-400 text-xs font-medium mb-5">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              {activeCategory && ` · ${TABS.find(t => t.value === activeCategory)?.label}`}
            </p>

            {/* Masonry columns */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
              {photos.map((photo, idx) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={idx}
                  priority={idx === 0}
                  onOpen={setLightboxIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && photos?.length > 0 && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
