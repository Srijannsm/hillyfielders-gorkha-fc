import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DataTable from '../../admin/components/DataTable'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position' },
]

const data = [
  { id: 1, name: 'Alice', position: 'GK' },
  { id: 2, name: 'Bob', position: 'DEF' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('GK')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows "No records found." when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No records found.')).toBeInTheDocument()
  })

  it('shows "Loading..." when loading is true', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('calls onEdit with the row when Edit is clicked', () => {
    const onEdit = vi.fn()
    render(<DataTable columns={columns} data={data} onEdit={onEdit} />)
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(data[0])
  })

  it('calls onDelete with the row when Delete is clicked', () => {
    const onDelete = vi.fn()
    render(<DataTable columns={columns} data={data} onDelete={onDelete} />)
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[1])
    expect(onDelete).toHaveBeenCalledWith(data[1])
  })

  it('does not render Edit button when onEdit is not provided', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('does not render Delete button when onDelete is not provided', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('uses custom render function from column definition', () => {
    const cols = [
      { key: 'name', label: 'Name', render: (row) => <span data-testid="custom">{row.name.toUpperCase()}</span> },
    ]
    render(<DataTable columns={cols} data={[{ id: 1, name: 'alice' }]} />)
    expect(screen.getByTestId('custom')).toHaveTextContent('ALICE')
  })

  it('renders Actions column header', () => {
    render(<DataTable columns={columns} data={data} onEdit={vi.fn()} />)
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
