import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterChips, CategoryOption } from '../CategoryFilterChips';

describe('CategoryFilterChips Component', () => {
  it('renders default quick system categories without navigation buttons', () => {
    const onSelect = vi.fn();
    render(<CategoryFilterChips selected="" onSelect={onSelect} />);

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /gulir/i })).not.toBeInTheDocument();
  });

  it('renders custom categories seamlessly ordered after system categories', () => {
    const onSelect = vi.fn();
    const mockCategories: CategoryOption[] = [
      { label: 'Semua', slug: '', isProtected: true },
      { label: 'Villa', slug: 'villa', isProtected: true },
      { label: 'Glamping', slug: 'glamping', isProtected: false, propertyCount: 2 },
      { label: 'Treehouse', slug: 'treehouse', isProtected: false, propertyCount: 1 },
    ];

    render(<CategoryFilterChips selected="" onSelect={onSelect} categories={mockCategories} />);

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Glamping')).toBeInTheDocument();
    expect(screen.getByText('Treehouse')).toBeInTheDocument();
    expect(screen.queryByText(/kustom:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /gulir/i })).not.toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Semua', 'Villa', 'Glamping', 'Treehouse']);

    fireEvent.click(screen.getByText('Glamping'));
    expect(onSelect).toHaveBeenCalledWith('glamping');
  });

  it('excludes custom categories that have 0 properties', () => {
    const onSelect = vi.fn();
    const mockCategories: CategoryOption[] = [
      { label: 'Semua', slug: '', isProtected: true },
      { label: 'Villa', slug: 'villa', isProtected: true },
      { label: 'Glamping', slug: 'glamping', isProtected: false, propertyCount: 3 },
      { label: 'Cottage', slug: 'cottage', isProtected: false, propertyCount: 0 },
    ];

    render(<CategoryFilterChips selected="" onSelect={onSelect} categories={mockCategories} />);

    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Glamping')).toBeInTheDocument();
    expect(screen.queryByText('Cottage')).not.toBeInTheDocument();
  });
});
