import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { useAuthStore } from '../../../stores/auth.store';

describe('Navbar Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });
    vi.clearAllMocks();
  });

  it('renders landing page navigation links when on root path ("/")', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    // Desktop nav
    const desktopNav = screen.getByRole('navigation', { name: /Navigasi Halaman Utama/i });
    expect(desktopNav).toBeInTheDocument();
    expect(screen.getAllByText('Rekomendasi Penginapan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Penginapan Terdekat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About Us').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contact Us').length).toBeGreaterThan(0);

    // Mobile nav strip
    const mobileStrip = screen.getByRole('navigation', { name: /Navigasi Cepat Penginapan/i });
    expect(mobileStrip).toBeInTheDocument();
  });

  it('does NOT render landing page navigation links on other pages ("/search")', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('navigation', { name: /Navigasi Halaman Utama/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Navigasi Cepat Penginapan/i })).not.toBeInTheDocument();
  });

  it('triggers smooth scroll when clicking anchor links', () => {
    const scrollIntoViewMock = vi.fn();
    const fakeElement = document.createElement('div');
    fakeElement.id = 'rekomendasi';
    fakeElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(fakeElement);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const link = screen.getAllByText('Rekomendasi Penginapan')[0];
    fireEvent.click(link);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(fakeElement);
  });

  it('renders user menu and avatar for authenticated user without collision', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'u-1',
        name: 'Budi Santoso',
        email: 'budi@example.com',
        role: 'USER',
        avatarUrl: null,
      },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const accountButton = screen.getByRole('button', { name: /Menu Akun/i });
    expect(accountButton).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
