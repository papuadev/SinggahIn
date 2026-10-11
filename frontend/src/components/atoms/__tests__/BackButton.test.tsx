import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackButton } from '../BackButton';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BackButton Component', () => {
  it('renders default label and icon', () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /kembali/i })).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(
      <MemoryRouter>
        <BackButton label="Kembali ke Katalog" />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /kembali ke katalog/i })).toBeInTheDocument();
  });

  it('calls navigate with -1 when history length is greater than 1', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 3 },
      writable: true,
    });
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls navigate with fallbackUrl when history length is 1 or less', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true,
    });
    render(
      <MemoryRouter>
        <BackButton fallbackUrl="/properties/prop-1" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/properties/prop-1');
  });
});
