import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantCategoryPage } from '../TenantCategoryPage';
import {
  usePropertyCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../../modules/property/hooks/useProperties';
import { useAuthStore } from '../../../stores/auth.store';

vi.mock('../../../modules/property/hooks/useProperties', () => ({
  usePropertyCategories: vi.fn(),
  useCreateCategory: vi.fn(),
  useUpdateCategory: vi.fn(),
  useDeleteCategory: vi.fn(),
}));

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Villa',
    slug: 'villa',
    description: 'Rumah privat',
    isProtected: true,
    propertyCount: 4,
  },
  {
    id: 'cat-2',
    name: 'Glamping',
    slug: 'glamping',
    tenantId: 'tenant-1',
    description: 'Kemah mewah',
    isProtected: false,
    propertyCount: 0,
  },
  {
    id: 'cat-3',
    name: 'Treehouse',
    slug: 'treehouse',
    tenantId: 'tenant-other',
    description: 'Rumah pohon',
    isProtected: false,
    propertyCount: 0,
  },
];

describe('TenantCategoryPage Component', () => {
  const mutateCreate = vi.fn();
  const mutateUpdate = vi.fn();
  const mutateDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'tenant-1', email: 'tenant@test.com', role: 'TENANT' } as any,
      isAuthenticated: true,
    });
    vi.mocked(usePropertyCategories).mockReturnValue({
      data: mockCategories as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(useCreateCategory).mockReturnValue({ mutateAsync: mutateCreate, isPending: false } as any);
    vi.mocked(useUpdateCategory).mockReturnValue({ mutateAsync: mutateUpdate, isPending: false } as any);
    vi.mocked(useDeleteCategory).mockReturnValue({ mutateAsync: mutateDelete, isPending: false } as any);
  });

  it('renders system categories and only owned custom categories, hiding other tenants categories', () => {
    render(<TenantCategoryPage />);

    expect(screen.getByText('Kategori Bawaan Sistem')).toBeInTheDocument();
    expect(screen.getByText('Kategori Kustom Saya')).toBeInTheDocument();
    expect(screen.getByText('Villa')).toBeInTheDocument();
    expect(screen.getByText('Terkunci')).toBeInTheDocument();

    expect(screen.getByText('Glamping')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ubah/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hapus/i })).toBeInTheDocument();

    expect(screen.queryByText('Treehouse')).not.toBeInTheDocument();
  });

  it('opens create modal when clicking Tambah Kategori', () => {
    render(<TenantCategoryPage />);

    const addButton = screen.getByRole('button', { name: /tambah kategori/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Tambah Kategori Baru')).toBeInTheDocument();
  });

  it('opens delete modal when clicking Hapus on owned custom category', () => {
    render(<TenantCategoryPage />);

    const deleteBtn = screen.getByRole('button', { name: /hapus/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Hapus Kategori Properti')).toBeInTheDocument();
  });
});
