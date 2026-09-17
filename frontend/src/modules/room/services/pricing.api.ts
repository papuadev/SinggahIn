import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  RoomPriceModifier,
  CreatePeakRatePayload,
  RoomUnavailability,
  CreateRoomUnavailabilityPayload,
} from '../pricing.types';

export const pricingApi = {
  async getRoomRates(roomId: string): Promise<ApiResponse<RoomPriceModifier[]>> {
    const res = await apiClient.get<ApiResponse<RoomPriceModifier[]>>(`/rooms/${roomId}/rates`);
    return res.data;
  },

  async createRoomRate(
    roomId: string,
    data: CreatePeakRatePayload
  ): Promise<ApiResponse<RoomPriceModifier>> {
    const res = await apiClient.post<ApiResponse<RoomPriceModifier>>(`/rooms/${roomId}/rates`, data);
    return res.data;
  },

  async deleteRoomRate(roomId: string, rateId: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/rooms/${roomId}/rates/${rateId}`);
    return res.data;
  },

  async bulkCreatePropertyRates(
    propertyId: string,
    data: CreatePeakRatePayload
  ): Promise<ApiResponse<RoomPriceModifier[]>> {
    const res = await apiClient.post<ApiResponse<RoomPriceModifier[]>>(
      `/properties/${propertyId}/rooms/rates`,
      data
    );
    return res.data;
  },

  async getRoomUnavailabilities(roomId: string): Promise<ApiResponse<RoomUnavailability[]>> {
    const res = await apiClient.get<ApiResponse<RoomUnavailability[]>>(`/rooms/${roomId}/unavailability`);
    return res.data;
  },

  async createRoomUnavailability(
    roomId: string,
    data: CreateRoomUnavailabilityPayload
  ): Promise<ApiResponse<RoomUnavailability>> {
    const res = await apiClient.post<ApiResponse<RoomUnavailability>>(`/rooms/${roomId}/unavailability`, data);
    return res.data;
  },

  async deleteRoomUnavailability(
    roomId: string,
    unavailabilityId: string
  ): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/rooms/${roomId}/unavailability/${unavailabilityId}`
    );
    return res.data;
  },
};
