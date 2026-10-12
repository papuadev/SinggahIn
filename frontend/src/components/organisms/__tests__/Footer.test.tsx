import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders brand info and description in footer', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByAltText('SinggahIn')).toBeInTheDocument();
    expect(screen.getByText(/Platform reservasi hotel, villa/i)).toBeInTheDocument();
  });

  it('renders accommodation menu links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Cari Penginapan')).toBeInTheDocument();
    expect(screen.getByText('Hotel & Resort')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Homestay')).toBeInTheDocument();
    expect(screen.getByText('Penginapan di Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Penginapan di Yogyakarta')).toBeInTheDocument();
    expect(screen.getByText('Penginapan di Bali')).toBeInTheDocument();
  });

  it('renders about us and company links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('About Us & Bantuan')).toBeInTheDocument();
    expect(screen.getByText('Tentang SinggahIn')).toBeInTheDocument();
    expect(screen.getByText('Visi & Misi Perusahaan')).toBeInTheDocument();
    expect(screen.getByText('Daftar Mitra Properti (Tenant)')).toBeInTheDocument();
  });

  it('renders contact details and social media links with accessible labels', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Section id contact-us
    expect(container.querySelector('#contact-us')).toBeInTheDocument();

    // Contact info
    expect(screen.getByText('support@singgahin.biz.id')).toBeInTheDocument();
    expect(screen.getByText(/\+62 822-4770-0456/i)).toBeInTheDocument();
    expect(screen.getByText(/Gedung SinggahIn/i)).toBeInTheDocument();

    // Social icons
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Twitter / X' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'YouTube' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
  });
});
