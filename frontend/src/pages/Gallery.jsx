import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGallery } from '../services/api'
import SEO from '../components/SEO'
import GallerySkeleton from '../components/skeletons/GallerySkeleton'

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

/* ── Lightbox ───────────────────────────────────────────── */
function Lightbox({ photo, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-gfc-lime transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          Close <span className="text-base leading-none">✕</span>
        </button>

        {/* Image */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gfc-900">
          <img
            src={photo.image}
            alt={photo.title}
            className="max-h-[75vh] max-w-full object-contain"
          />
        </div>

        {/* Caption bar */}
        <div className="bg-gfc-900 border-t border-gfc-700 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-black uppercase text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {photo.title}
              </p>
              {photo.caption && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{photo.caption}</p>
              )}
            </div>
            <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${BADGE_COLORS[photo.category] || 'bg-gfc-700 text-white'}`}>
              {photo.category_display}
            </span>
          </div>
          {photo.date_taken && (
            <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-3 h-px bg-gfc-lime inline-block" />
              {new Date(photo.date_taken).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Photo card ─────────────────────────────────────────── */
function PhotoCard({ photo, onClick }) {
  return (
    <div
      className="relative group cursor-pointer overflow-hidden bg-gfc-800 mb-4 break-inside-avoid"
      onClick={() => onClick(photo)}
    >
      <img
        src={photo.image}
        alt={photo.title}
        className="w-full block group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* Category badge — always visible */}
      <span className={`absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${BADGE_COLORS[photo.category] || 'bg-gfc-700 text-white'}`}>
        {photo.category_display}
      </span>

      {/* Full dark overlay on hover — title centered */}
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

/* ── Empty state ────────────────────────────────────────── */
function EmptyState({ category }) {
  const label = TABS.find(t => t.value === category)?.label || 'Gallery'
  return (
    <div className="text-center py-24 border border-gfc-700/30 bg-gfc-900/30">
      <p className="text-gfc-lime/10 font-black text-6xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
      <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No Photos Yet</p>
      <p className="text-gray-600 text-sm mt-1">
        {category ? `No ${label} photos have been published.` : 'No photos have been published yet.'}
      </p>
      <p className="text-gray-700 text-xs mt-1">Check back soon.</p>
    </div>
  )
}

/* ── Gallery page ───────────────────────────────────────── */
export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('')
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  // Fetch all photos once, filter client-side
  const { data: allPhotos, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => getGallery(''),
  })

  const photos = activeCategory
    ? allPhotos?.filter(p => p.category === activeCategory)
    : allPhotos

  // Count per category
  const counts = allPhotos?.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {}) ?? {}

  const openLightbox = useCallback((photo) => setLightboxPhoto(photo), [])
  const closeLightbox = useCallback(() => setLightboxPhoto(null), [])

  return (
    <div className="min-h-screen bg-gfc-900">
      <SEO
        title="Gallery"
        description="Photos from training sessions, match days and academy programmes at Hillyfielders Gorkha FC."
      />

      {/* ── Page header ── */}
      <section className="section-bg bg-gfc-900 text-white pt-20 pb-16 px-6">
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

      {/* ── Filter tabs ── */}
      <div className="bg-gfc-800 border-b border-gfc-700 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-stretch gap-0 overflow-x-auto no-scrollbar">
            {TABS.map(tab => {
              const count = tab.value === '' ? allPhotos?.length : counts[tab.value]
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveCategory(tab.value)}
                  className={`flex-shrink-0 px-6 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === tab.value
                      ? 'text-gfc-lime border-gfc-lime'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-gfc-lime/40'
                  }`}
                >
                  {tab.label}
                  {count != null && count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm leading-none ${
                      activeCategory === tab.value
                        ? 'bg-gfc-lime text-gfc-900'
                        : 'bg-gfc-700 text-gray-400'
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
        {isLoading ? (
          <GallerySkeleton count={8} />
        ) : !photos?.length ? (
          <EmptyState category={activeCategory} />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {photos.map(photo => (
              <PhotoCard key={photo.id} photo={photo} onClick={openLightbox} />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={closeLightbox} />
      )}
    </div>
  )
}
