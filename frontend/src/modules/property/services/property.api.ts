import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  PropertyCategory,
  PropertyItem,
  PropertyImage,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  ReverseGeocodeResult,
  GeocodeSuggestion,
  CatalogPropertyItem,
  CatalogQueryParams,
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

  async searchGeocode(
    query: string,
    limit = 5
  ): Promise<ApiResponse<GeocodeSuggestion[]>> {
    const res = await apiClient.get<ApiResponse<GeocodeSuggestion[]>>(
      '/properties/geocode/search',
      { params: { query, limit } }
    );
    return res.data;
  },

  async uploadImages(
    propertyId: string,
    files: File[]
  ): Promise<ApiResponse<PropertyImage[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const res = await apiClient.post<ApiResponse<PropertyImage[]>>(
      `/properties/${propertyId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async deleteImage(
    propertyId: string,
    imageId: string
  ): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/properties/${propertyId}/images/${imageId}`
    );
    return res.data;
  },

  async setCoverImage(
    propertyId: string,
    imageId: string
  ): Promise<ApiResponse<PropertyImage>> {
    const res = await apiClient.patch<ApiResponse<PropertyImage>>(
      `/properties/${propertyId}/images/${imageId}/cover`
    );
    return res.data;
  },

  async getCatalog(
    params?: CatalogQueryParams
  ): Promise<ApiResponse<CatalogPropertyItem[]>> {
    const res = await apiClient.get<ApiResponse<CatalogPropertyItem[]>>(
      '/properties',
      { params }
    );
    return res.data;
  },
};

