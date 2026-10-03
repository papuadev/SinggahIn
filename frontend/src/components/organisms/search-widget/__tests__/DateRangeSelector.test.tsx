import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeSelector } from '../DateRangeSelector';

describe('DateRangeSelector Organism Component', () => {
  it('renders placeholder dates when empty', () => {
    render(<DateRangeSelector checkIn="" checkOut="" onChange={vi.fn()} />);
    const placeholders = screen.getAllByText('dd/mm/yyyy');
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });

  it('renders formatted date range and night count badge', () => {
    render(<DateRangeSelector checkIn="2026-10-01" checkOut="2026-10-04" onChange={vi.fn()} />);
    expect(screen.getByText('01/10/2026')).toBeInTheDocument();
    expect(screen.getByText('04/10/2026')).toBeInTheDocument();
    expect(screen.getByText(/3 Malam/i)).toBeInTheDocument();
  });

  it('opens popover when trigger button is clicked', () => {
    render(<DateRangeSelector checkIn="" checkOut="" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /Pilih rentang tanggal menginap/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: /Selesai/i })).toBeInTheDocument();
  });

  it('closes popover on Escape key press for WCAG 2.1 accessibility', () => {
    render(<DateRangeSelector checkIn="" checkOut="" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /Pilih rentang tanggal menginap/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: /Selesai/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: /Selesai/i })).not.toBeInTheDocument();
  });

  it('closes popover on outside click', () => {
    render(
      <div>
        <span data-testid="outside">Outside area</span>
        <DateRangeSelector checkIn="" checkOut="" onChange={vi.fn()} />
      </div>
    );
    const trigger = screen.getByRole('button', { name: /Pilih rentang tanggal menginap/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: /Selesai/i })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('button', { name: /Selesai/i })).not.toBeInTheDocument();
  });

  it('calls onChange with empty strings when Reset button is clicked', () => {
    const mockOnChange = vi.fn();
    render(<DateRangeSelector checkIn="2026-10-01" checkOut="2026-10-04" onChange={mockOnChange} />);
    const trigger = screen.getByRole('button', { name: /Pilih rentang tanggal menginap/i });
    fireEvent.click(trigger);

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);
    expect(mockOnChange).toHaveBeenCalledWith('', '');
  });
});
