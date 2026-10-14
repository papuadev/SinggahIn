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

  it('renders story, vision, and mission sections', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Membangun Standar Baru Kenyamanan Menginap Tanpa Biaya Tersembunyi/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Visi & Misi SinggahIn/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Menjadi ekosistem reservasi akomodasi paling tepercaya di Indonesia/i)
    ).toBeInTheDocument();
  });

  it('renders core values and principles', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Prinsip yang Selalu Kami Pegang Teguh/i)).toBeInTheDocument();
    expect(screen.getByText(/Transparansi Tarif Penuh/i)).toBeInTheDocument();
    expect(screen.getByText(/Keamanan & Verifikasi Resmi/i)).toBeInTheDocument();
    expect(screen.getByText(/Dukungan untuk Mitra Lokal/i)).toBeInTheDocument();
    expect(screen.getByText(/Layanan Pelanggan Responsif/i)).toBeInTheDocument();
  });
});
