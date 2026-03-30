import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGallery } from '../services/api'
import SEO from '../components/SEO'

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

/* ── Skeleton card ──────────────────────────────────────── */
function SkeletonCard({ tall }) {
  return (
    <div
      className={`bg-gfc-800 animate-pulse rounded-sm mb-4 ${tall ? 'h-72' : 'h-48'}`}
    />
  )
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

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Category badge — always visible */}
      <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${BADGE_COLORS[photo.category] || 'bg-gfc-700 text-white'}`}>
        {photo.category_display}
      </span>

      {/* Title + caption — visible on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white font-black uppercase text-sm leading-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
          {photo.title}
        </p>
        {photo.caption && (
          <p className="text-gray-300 text-xs mt-1 line-clamp-2 leading-relaxed">{photo.caption}</p>
        )}
      </div>

      {/* Expand icon */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-7 h-7 bg-gfc-lime/90 flex items-center justify-center">
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

  const { data: photos, isLoading } = useQuery({
    queryKey: ['gallery', activeCategory],
    queryFn: () => getGallery(activeCategory),
  })

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
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`flex-shrink-0 px-5 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === tab.value
                    ? 'text-gfc-lime border-gfc-lime'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gfc-lime/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Masonry grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {isLoading ? (
          /* Skeleton — mimics 3-col masonry */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} tall={i % 3 === 0} />
            ))}
          </div>
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
