import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogPagination } from '../CatalogPagination';

describe('CatalogPagination Component', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <CatalogPagination page={1} totalPages={1} totalItems={10} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all page numbers without ellipsis when totalPages <= 7', () => {
    render(
      <CatalogPagination page={3} totalPages={5} totalItems={50} onPageChange={vi.fn()} />
    );

    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    }
    expect(screen.queryByTestId('pagination-ellipsis')).not.toBeInTheDocument();
  });

  it('renders right ellipsis when current <= 4 and totalPages > 7', () => {
    render(
      <CatalogPagination page={2} totalPages={20} totalItems={200} onPageChange={vi.fn()} />
    );

    [1, 2, 3, 4, 5, 20].forEach((p) => {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Halaman 6' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('pagination-ellipsis').length).toBe(1);
  });

  it('renders double ellipsis when current is in the middle (e.g. 1 ... 4 5 6 ... 20)', () => {
    render(
      <CatalogPagination page={5} totalPages={20} totalItems={200} onPageChange={vi.fn()} />
    );

    [1, 4, 5, 6, 20].forEach((p) => {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Halaman 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Halaman 7' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('pagination-ellipsis').length).toBe(2);
  });

  it('renders left ellipsis when current >= totalPages - 3', () => {
    render(
      <CatalogPagination page={19} totalPages={20} totalItems={200} onPageChange={vi.fn()} />
    );

    [1, 16, 17, 18, 19, 20].forEach((p) => {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Halaman 15' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('pagination-ellipsis').length).toBe(1);
  });

  it('triggers onPageChange when page button or nav buttons are clicked', () => {
    const handlePage = vi.fn();
    render(
      <CatalogPagination page={5} totalPages={20} totalItems={200} onPageChange={handlePage} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Halaman 6' }));
    expect(handlePage).toHaveBeenCalledWith(6);

    fireEvent.click(screen.getByRole('button', { name: 'Sebelumnya' }));
    expect(handlePage).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(handlePage).toHaveBeenCalledWith(6);
  });

  it('disables nav buttons at boundaries', () => {
    const { rerender } = render(
      <CatalogPagination page={1} totalPages={5} totalItems={50} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Berikutnya' })).not.toBeDisabled();

    rerender(
      <CatalogPagination page={5} totalPages={5} totalItems={50} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Berikutnya' })).toBeDisabled();
  });
});
