import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePickerInput } from '../DatePickerInput';

describe('DatePickerInput Molecule', () => {
  it('renders trigger button and hidden date input', () => {
    render(
      <DatePickerInput id="test-date" min="2026-10-01" value="" onChange={vi.fn()} aria-label="Tanggal Mulai" />
    );
    expect(screen.getByText('Pilih tanggal')).toBeInTheDocument();
    const hidden = document.getElementById('test-date');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('min', '2026-10-01');
    expect(hidden).toHaveAttribute('type', 'date');
  });

  it('formats and displays value in dd/MM/yyyy format', () => {
    render(
      <DatePickerInput id="test-date" value="2026-10-15" onChange={vi.fn()} />
    );
    expect(screen.getByText('15/10/2026')).toBeInTheDocument();
  });

  it('opens popover and renders Indonesian day abbreviations', () => {
    render(
      <DatePickerInput id="test-date" value="2026-10-15" onChange={vi.fn()} />
    );
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('closes popover on Escape key press for WCAG 2.1 accessibility', () => {
    render(
      <DatePickerInput id="test-date" value="2026-10-15" onChange={vi.fn()} />
    );
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByText('Min')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Min')).not.toBeInTheDocument();
  });

  it('calls onChange when hidden date input changes', () => {
    const handleChange = vi.fn();
    render(
      <DatePickerInput id="test-date" value="" onChange={handleChange} aria-label="Tanggal Mulai" />
    );
    const hidden = screen.getByLabelText(/Tanggal Mulai/i);
    fireEvent.change(hidden, { target: { value: '2026-12-25' } });
    expect(handleChange).toHaveBeenCalledWith('2026-12-25');
  });
});
