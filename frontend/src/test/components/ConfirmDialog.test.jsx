import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfirmDialog from '../../admin/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <ConfirmDialog open={false} message="Delete this?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders message when open is true', () => {
    render(
      <ConfirmDialog open={true} message="Delete this item?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
  })

  it('shows default message when message prop is omitted', () => {
    render(<ConfirmDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open={true} message="Sure?" onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open={true} message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders both Cancel and Delete buttons', () => {
    render(<ConfirmDialog open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})
