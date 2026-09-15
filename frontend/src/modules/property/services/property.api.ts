import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  PropertyCategory,
  PropertyItem,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  ReverseGeocodeResult,
} from '../property.types';

export const propertyApi = {
  async getCategories(): Promise<ApiResponse<PropertyCategory[]>> {
    const res = await apiClient.get<ApiResponse<PropertyCategory[]>>(
      '/properties/categories'
    );
    return res.data;
  },

  async getMyProperties(): Promise<ApiResponse<PropertyItem[]>> {
    const res = await apiClient.get<ApiResponse<PropertyItem[]>>(
      '/properties/my-properties'
    );
    return res.data;
  },

  async getPropertyById(id: string): Promise<ApiResponse<PropertyItem>> {
    const res = await apiClient.get<ApiResponse<PropertyItem>>(
      `/properties/${id}`
    );
    return res.data;
  },

  async createProperty(
    data: CreatePropertyPayload
  ): Promise<ApiResponse<PropertyItem>> {
    const res = await apiClient.post<ApiResponse<PropertyItem>>(
      '/properties',
      data
    );
    return res.data;
  },

  async updateProperty(
    id: string,
    data: UpdatePropertyPayload
  ): Promise<ApiResponse<PropertyItem>> {
    const res = await apiClient.patch<ApiResponse<PropertyItem>>(
      `/properties/${id}`,
      data
    );
    return res.data;
  },

  async deleteProperty(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/properties/${id}`);
    return res.data;
  },

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<ReverseGeocodeResult>> {
    const res = await apiClient.get<ApiResponse<ReverseGeocodeResult>>(
      '/properties/geocode/reverse',
      { params: { latitude, longitude } }
    );
    return res.data;
  },
};
