import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LazyImage from '../../components/LazyImage'

// IntersectionObserver is not available in jsdom — must be a real constructor
class MockIntersectionObserver {
  constructor() {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.IntersectionObserver = MockIntersectionObserver

describe('LazyImage', () => {
  it('renders a container element', () => {
    const { container } = render(<LazyImage src="/img/test.jpg" alt="Test image" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the img element in natural-flow mode (no width/height)', () => {
    render(<LazyImage src="/img/test.jpg" alt="Test image" />)
    const img = screen.getByRole('img', { name: 'Test image' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/img/test.jpg')
  })

  it('uses loading="lazy" by default', () => {
    render(<LazyImage src="/img/test.jpg" alt="Test" />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('uses loading="eager" when priority=true', () => {
    render(<LazyImage src="/img/test.jpg" alt="Test" priority />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveAttribute('loading', 'eager')
  })

  it('passes alt text to img element', () => {
    render(<LazyImage src="/img/photo.jpg" alt="Player photo" />)
    expect(screen.getByAltText('Player photo')).toBeInTheDocument()
  })

  it('applies fill class when fill=true', () => {
    const { container } = render(<LazyImage src="/img/test.jpg" alt="Fill" fill />)
    expect(container.firstChild).toHaveClass('absolute')
  })

  it('sets aspect ratio style when width and height are provided', () => {
    const { container } = render(
      <LazyImage src="/img/test.jpg" alt="Aspect" width={800} height={600} />
    )
    expect(container.firstChild).toHaveStyle({ aspectRatio: '800 / 600' })
  })

  it('renders thumbnail img with aria-hidden when thumbnail and fill props are provided', () => {
    const { container } = render(
      <LazyImage src="/img/full.jpg" alt="Full" thumbnail="/img/thumb.jpg" fill />
    )
    const ariaHidden = container.querySelector('img[aria-hidden="true"]')
    expect(ariaHidden).toBeInTheDocument()
  })
})
