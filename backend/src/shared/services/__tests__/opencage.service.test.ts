import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { forwardGeocode, reverseGeocode } from '../opencage.service';

describe('OpenCage Service (Axios)', () => {
  const originalEnv = process.env.OPENCAGE_API_KEY;

  beforeEach(() => {
    process.env.OPENCAGE_API_KEY = 'test-api-key';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.OPENCAGE_API_KEY = originalEnv;
  });

  describe('forwardGeocode', () => {
    it('returns null if OPENCAGE_API_KEY is missing', async () => {
      delete process.env.OPENCAGE_API_KEY;
      const result = await forwardGeocode('Jl. Braga', 'Bandung');
      expect(result).toBeNull();
    });

    it('returns null if address and city are empty', async () => {
      const result = await forwardGeocode('', '');
      expect(result).toBeNull();
    });

    it('returns coordinates and formatted address on valid response', async () => {
      const mockResponse = {
        results: [
          {
            geometry: { lat: -6.9218, lng: 107.607 },
            formatted: 'Kota Bandung, Jawa Barat, Indonesia',
            components: { _normalized_city: 'Kota Bandung' },
          },
        ],
        status: { code: 200, message: 'OK' },
      };

      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
      });

      const result = await forwardGeocode('Jl. Braga', 'Bandung');
      expect(result).toEqual({
        latitude: -6.9218,
        longitude: 107.607,
        formattedAddress: 'Kota Bandung, Jawa Barat, Indonesia',
      });
    });

    it('returns null when axios.get fails with network error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network error'));
      const result = await forwardGeocode('Jl. Braga', 'Bandung');
      expect(result).toBeNull();
    });
  });

  describe('reverseGeocode', () => {
    it('returns null if OPENCAGE_API_KEY is missing', async () => {
      delete process.env.OPENCAGE_API_KEY;
      const result = await reverseGeocode(-6.9218, 107.607);
      expect(result).toBeNull();
    });

    it('returns city, address, and formatted string on valid response', async () => {
      const mockResponse = {
        results: [
          {
            geometry: { lat: -6.9218, lng: 107.607 },
            formatted: 'Jalan Alun-alun Timur, Balonggede, Kota Bandung 40251',
            components: {
              _normalized_city: 'Kota Bandung',
              road: 'Jalan Alun-alun Timur',
              house_number: '10',
            },
          },
        ],
        status: { code: 200, message: 'OK' },
      };

      vi.spyOn(axios, 'get').mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
      });

      const result = await reverseGeocode(-6.9218, 107.607);
      expect(result).toEqual({
        city: 'Kota Bandung',
        address: 'Jalan Alun-alun Timur No. 10',
        formatted: 'Jalan Alun-alun Timur, Balonggede, Kota Bandung 40251',
      });
    });

    it('returns null when axios.get throws an error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('401 Unauthorized'));

      const result = await reverseGeocode(-6.9218, 107.607);
      expect(result).toBeNull();
    });
  });
});
