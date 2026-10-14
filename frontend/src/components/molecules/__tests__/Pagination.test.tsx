import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination Molecule Component', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalItems={10} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all page numbers without ellipsis when totalPages <= 7', () => {
    render(
      <Pagination page={3} totalPages={5} totalItems={50} onPageChange={vi.fn()} />
    );

    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    }
    expect(screen.queryByTestId('pagination-ellipsis')).not.toBeInTheDocument();
  });

  it('renders right ellipsis when current <= 4 and totalPages > 7', () => {
    render(
      <Pagination page={2} totalPages={20} totalItems={200} onPageChange={vi.fn()} />
    );

    [1, 2, 3, 4, 5, 20].forEach((p) => {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Halaman 6' })).not.toBeInTheDocument();
    expect(screen.getAllByTestId('pagination-ellipsis').length).toBe(1);
  });

  it('renders double ellipsis when current is in the middle', () => {
    render(
      <Pagination page={5} totalPages={20} totalItems={200} onPageChange={vi.fn()} />
    );

    [1, 4, 5, 6, 20].forEach((p) => {
      expect(screen.getByRole('button', { name: `Halaman ${p}` })).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('pagination-ellipsis').length).toBe(2);
  });

  it('triggers onPageChange when clicking page button or nav buttons', () => {
    const handlePage = vi.fn();
    render(
      <Pagination page={5} totalPages={20} totalItems={200} onPageChange={handlePage} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Halaman 6' }));
    expect(handlePage).toHaveBeenCalledWith(6);

    fireEvent.click(screen.getByRole('button', { name: 'Sebelumnya' }));
    expect(handlePage).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(handlePage).toHaveBeenCalledWith(6);
  });

  it('renders item label and counts properly', () => {
    render(
      <Pagination page={2} totalPages={10} totalItems={100} itemLabel="pesanan" onPageChange={vi.fn()} />
    );
    expect(screen.getByText(/100 total pesanan/i)).toBeInTheDocument();
  });

  it('renders start-end range when pageSize is provided', () => {
    render(
      <Pagination
        page={2}
        totalPages={4}
        totalItems={20}
        pageSize={5}
        itemLabel="tipe kamar"
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/6 - 10/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
    expect(screen.getByText(/tipe kamar/)).toBeInTheDocument();
  });

  it('uses custom ariaLabel or defaults to itemLabel navigation', () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        totalItems={15}
        itemLabel="properti"
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Navigasi halaman properti')).toBeInTheDocument();
  });
});
