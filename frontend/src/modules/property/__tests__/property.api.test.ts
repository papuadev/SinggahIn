import { describe, it, expect, vi, beforeEach } from 'vitest';
import { propertyApi } from '../services/property.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Property API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCategories should call /properties/categories and return categories data', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Villa', slug: 'villa', description: 'Villa nyaman' },
      { id: 'cat-2', name: 'Hotel', slug: 'hotel', description: 'Hotel berbintang' },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockCategories },
    });

    const result = await propertyApi.getCategories();

    expect(apiClient.get).toHaveBeenCalledWith('/properties/categories');
    expect(result.data).toEqual(mockCategories);
  });

  it('getMyProperties should call /properties/my-properties', async () => {
    const mockProperties = [{ id: 'prop-1', title: 'Villa Hijau' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockProperties },
    });

    const result = await propertyApi.getMyProperties();

    expect(apiClient.get).toHaveBeenCalledWith('/properties/my-properties');
    expect(result.data).toEqual(mockProperties);
  });

  it('getPropertyById should call /properties/:id', async () => {
    const mockProperty = { id: 'prop-1', title: 'Villa Hijau' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockProperty },
    });

    const result = await propertyApi.getPropertyById('prop-1');

    expect(apiClient.get).toHaveBeenCalledWith('/properties/prop-1');
    expect(result.data).toEqual(mockProperty);
  });

  it('createProperty should post data to /properties', async () => {
    const payload = {
      title: 'Villa Hijau',
      categoryId: 'cat-1',
      description: 'Deskripsi lengkap',
      address: 'Jl. Lembang',
      city: 'Bandung',
      latitude: -6.8,
      longitude: 107.6,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Created', data: { id: 'prop-1', ...payload } },
    });

    const result = await propertyApi.createProperty(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/properties', payload);
    expect(result.data.id).toBe('prop-1');
  });

  it('updateProperty should patch data to /properties/:id', async () => {
    const updatePayload = { title: 'Villa Hijau Baru' };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: 'Updated', data: { id: 'prop-1', title: 'Villa Hijau Baru' } },
    });

    const result = await propertyApi.updateProperty('prop-1', updatePayload);

    expect(apiClient.patch).toHaveBeenCalledWith('/properties/prop-1', updatePayload);
    expect(result.data.title).toBe('Villa Hijau Baru');
  });

  it('deleteProperty should call delete on /properties/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted', data: null },
    });

    const result = await propertyApi.deleteProperty('prop-1');

    expect(apiClient.delete).toHaveBeenCalledWith('/properties/prop-1');
    expect(result.success).toBe(true);
  });

  it('reverseGeocode should call /properties/geocode/reverse with query params', async () => {
    const mockGeocode = { formattedAddress: 'Jl. Dago No. 1, Bandung', city: 'Bandung' };
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockGeocode },
    });

    const result = await propertyApi.reverseGeocode(-6.8, 107.6);

    expect(apiClient.get).toHaveBeenCalledWith('/properties/geocode/reverse', {
      params: { latitude: -6.8, longitude: 107.6 },
    });
    expect(result.data.city).toBe('Bandung');
  });

  it('searchGeocode should call /properties/geocode/search with query and limit params', async () => {
    const mockSuggestions = [
      { latitude: -6.8, longitude: 107.6, formattedAddress: 'Jl. Dago, Bandung', city: 'Bandung' },
    ];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockSuggestions },
    });

    const result = await propertyApi.searchGeocode('Dago', 5);

    expect(apiClient.get).toHaveBeenCalledWith('/properties/geocode/search', {
      params: { query: 'Dago', limit: 5 },
    });
    expect(result.data).toEqual(mockSuggestions);
  });

  it('getCatalog should call /properties with query params', async () => {
    const mockCatalog = [{ id: 'prop-1', title: 'Villa Indah' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: mockCatalog, meta: { totalPages: 1 } },
    });

    const result = await propertyApi.getCatalog({ city: 'Bandung', guests: 2 });

    expect(apiClient.get).toHaveBeenCalledWith('/properties', {
      params: { city: 'Bandung', guests: 2 },
    });
    expect(result.data).toEqual(mockCatalog);
  });
});

