import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TenantSidebar } from '../TenantSidebar';

describe('TenantSidebar Component', () => {
  it('renders all menu groups and links with updated naming', () => {
    render(
      <MemoryRouter initialEntries={['/tenant/dashboard']}>
        <TenantSidebar />
      </MemoryRouter>
    );

    // Dashboard
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();

    // Manajemen Transaksi
    expect(screen.getByText('Manajemen Transaksi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kelola Pesanan/i })).toBeInTheDocument();

    // Manajemen Properti
    expect(screen.getByText('Manajemen Properti')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tambah Properti/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kelola Properti/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kategori Properti/i })).toBeInTheDocument();

    // Laporan / Analytic
    expect(screen.getByText(/Laporan \/ Analytic/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Laporan Penjualan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Matriks Okupansi/i })).toBeInTheDocument();

    // Pengaturan Akun
    expect(screen.getByText('Pengaturan Akun')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Profil Saya/i })).toBeInTheDocument();
  });
});
