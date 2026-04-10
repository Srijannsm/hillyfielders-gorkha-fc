import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

/**
 * Lightbox — full-screen image viewer with arrow navigation.
 * Rendered via a React portal directly into document.body so it
 * always escapes any parent stacking context (sticky navbar, etc.).
 *
 * Props:
 *   photos       — array of photo objects ({ image, alt, title, caption })
 *   currentIndex — index of the currently visible photo
 *   onClose      — called when lightbox should close
 *   onNavigate   — called with the new index when user navigates
 */
export default function Lightbox({ photos, currentIndex, onClose, onNavigate }) {
  const photo = photos[currentIndex]
  const total  = photos.length
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < total - 1

  const prev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  const next = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')      onClose()
      else if (e.key === 'ArrowLeft')  prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  if (!photo) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* ── Left arrow ─────────────────────────────────────────────────────── */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* ── Right arrow ────────────────────────────────────────────────────── */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* ── Main panel ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col max-w-screen-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: counter + close */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-white/50 text-xs font-medium tabular-nums">
            {currentIndex + 1} / {total}
          </p>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            Close <span className="text-base leading-none">✕</span>
          </button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center bg-black/30">
          <img
            src={photo.image}
            alt={photo.alt || photo.title || ''}
            className="max-h-[78vh] max-w-full object-contain"
          />
        </div>

        {/* Caption bar */}
        {(photo.title || photo.caption) && (
          <div className="bg-black/60 px-5 py-3">
            {photo.title && (
              <p className="text-white font-black uppercase text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {photo.title}
              </p>
            )}
            {photo.caption && (
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{photo.caption}</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
