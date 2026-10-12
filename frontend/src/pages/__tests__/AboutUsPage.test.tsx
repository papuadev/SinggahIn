import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AboutUsPage } from '../AboutUsPage';

describe('AboutUsPage Component', () => {
  it('renders hero title, description, and action buttons', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Menghubungkan Perjalanan Anda dengan Kenyamanan Terbaik di Indonesia/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Mulai Cari Penginapan/i })).toBeInTheDocument();
    expect(screen.getByText(/Hubungi Tim Kami/i)).toBeInTheDocument();
  });

  it('renders key metrics and impact statistics', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Properti Terkurasi')).toBeInTheDocument();
    expect(screen.getByText('30+')).toBeInTheDocument();
    expect(screen.getByText('Kota & Destinasi')).toBeInTheDocument();
    expect(screen.getByText('25.000+')).toBeInTheDocument();
    expect(screen.getByText('Tamu Bahagia')).toBeInTheDocument();
    expect(screen.getByText('4.9 / 5')).toBeInTheDocument();
  });

  it('renders core values, vision, mission, and tenant CTA', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Transparansi Tarif Penuh/i)).toBeInTheDocument();
    expect(screen.getByText(/Keamanan & Verifikasi Resmi/i)).toBeInTheDocument();
    expect(screen.getByText(/Dukungan untuk Mitra Lokal/i)).toBeInTheDocument();
    expect(screen.getByText(/Visi & Misi SinggahIn/i)).toBeInTheDocument();
    expect(screen.getByText(/Punya Properti atau Penginapan\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar Sebagai Tenant/i })).toBeInTheDocument();
  });
});
