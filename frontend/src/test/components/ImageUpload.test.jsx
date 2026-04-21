import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageUpload from '../../admin/components/ImageUpload'

// URL.createObjectURL is not available in jsdom
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
})

describe('ImageUpload', () => {
  it('renders upload area with "Click to upload" when no image provided', () => {
    render(<ImageUpload name="photo" onChange={vi.fn()} />)
    expect(screen.getByText('Click to upload')).toBeInTheDocument()
  })

  it('renders label when label prop is provided', () => {
    render(<ImageUpload name="photo" label="Player Photo" onChange={vi.fn()} />)
    expect(screen.getByText('Player Photo')).toBeInTheDocument()
  })

  it('shows current image when currentUrl is provided', () => {
    render(<ImageUpload name="photo" currentUrl="/media/players/img.jpg" onChange={vi.fn()} />)
    const img = screen.getByRole('img', { name: 'preview' })
    expect(img).toHaveAttribute('src', '/media/players/img.jpg')
  })

  it('file input has accept="image/*"', () => {
    const { container } = render(<ImageUpload name="photo" onChange={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', 'image/*')
  })

  it('file input is hidden by default', () => {
    const { container } = render(<ImageUpload name="photo" onChange={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveClass('hidden')
  })

  it('calls onChange with the selected file', () => {
    const onChange = vi.fn()
    const { container } = render(<ImageUpload name="photo" onChange={onChange} />)
    const input = container.querySelector('input[type="file"]')
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(onChange).toHaveBeenCalledWith(file)
  })

  it('shows preview image after file is selected', () => {
    const { container } = render(<ImageUpload name="photo" onChange={vi.fn()} />)
    const input = container.querySelector('input[type="file"]')
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file] } })
    const img = screen.getByRole('img', { name: 'preview' })
    expect(img).toBeInTheDocument()
  })
})
