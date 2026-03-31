import { useRef, useEffect, useState } from 'react'

/**
 * LazyImage — blur-up lazy loader using IntersectionObserver.
 *
 * Three rendering modes, chosen automatically:
 *
 *  fill=true          → absolute inset-0, fills a positioned parent (Squad, News heroes)
 *  width>0 & height>0 → relative container with aspectRatio set (prevents CLS in masonry)
 *                        + blur-up thumbnail overlay
 *  fallback           → natural-flow block img (w-full block), for photos without
 *                        dimension metadata (legacy uploads, news covers, etc.)
 *
 * Props:
 *   src        — full image URL
 *   thumbnail  — tiny ~20px WebP for blur placeholder (optional, only used in fill/aspect modes)
 *   width      — pixel width  (enables aspect-ratio + blur-up)
 *   height     — pixel height
 *   alt        — alt text
 *   className  — extra classes on the outer container
 *   priority   — skip observer, load immediately (above-the-fold images)
 *   fill       — fill a positioned parent via absolute inset-0
 */
export default function LazyImage({
  src,
  thumbnail,
  width,
  height,
  alt = '',
  className = '',
  priority = false,
  fill = false,
}) {
  const containerRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // ── Pick rendering mode early (needed for observer decision) ──────────────
  const hasAspect   = !fill && width > 0 && height > 0
  const useAbsolute = fill || hasAspect

  // In natural-flow mode the container has no height until the image loads,
  // so isIntersecting is always false. Skip the observer; browser's native
  // loading="lazy" on the <img> handles deferred loading instead.
  const naturalFlow = !fill && !hasAspect
  const [isInView, setIsInView] = useState(priority || naturalFlow)

  // ── IntersectionObserver — only for fill/aspect modes ─────────────────────
  useEffect(() => {
    if (priority || naturalFlow) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [priority, naturalFlow])

  // ── Preload off-screen once in view ───────────────────────────────────────
  useEffect(() => {
    if (!isInView || !src || loaded) return
    const img = new window.Image()
    img.onload = () => setLoaded(true)
    img.src = src
  }, [isInView, src, loaded])

  // ── Container + image class derivations ──────────────────────────────────
  const containerClass = fill
    ? `absolute inset-0 overflow-hidden ${className}`
    : `relative overflow-hidden ${className}`

  const containerStyle = hasAspect
    ? { aspectRatio: `${width} / ${height}` }
    : undefined

  // In natural-flow mode the img drives the container height
  const imgBaseClass = useAbsolute
    ? 'absolute inset-0 w-full h-full object-cover'
    : 'w-full block'

  return (
    <div ref={containerRef} className={containerClass} style={containerStyle}>

      {/* Blur-up placeholder — only when we can size the container (absolute modes) */}
      {thumbnail && useAbsolute && (
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          className={imgBaseClass}
          style={{
            filter:     loaded ? 'blur(0)'   : 'blur(10px)',
            transform:  loaded ? 'scale(1)'  : 'scale(1.05)',
            transition: 'filter 0.4s ease, transform 0.4s ease',
          }}
        />
      )}

      {/* Full image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width  || undefined}
          height={height || undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : undefined}
          className={imgBaseClass}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  )
}
