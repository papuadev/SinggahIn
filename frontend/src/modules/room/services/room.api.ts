import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import { Room, CreateRoomPayload, UpdateRoomPayload } from '../room.types';

export interface GetRoomsParams {
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const roomApi = {
  async getRoomsByProperty(
    propertyId: string,
    params?: GetRoomsParams
  ): Promise<ApiResponse<Room[]>> {
    const url = `/properties/${propertyId}/rooms`;
    const res = await (params
      ? apiClient.get<ApiResponse<Room[]>>(url, { params })
      : apiClient.get<ApiResponse<Room[]>>(url));
    return res.data;
  },

  async getRoomById(id: string): Promise<ApiResponse<Room>> {
    const res = await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
    return res.data;
  },

  async createRoom(
    propertyId: string,
    data: CreateRoomPayload
  ): Promise<ApiResponse<Room>> {
    const res = await apiClient.post<ApiResponse<Room>>(
      `/properties/${propertyId}/rooms`,
      data
    );
    return res.data;
  },

  async updateRoom(
    id: string,
    data: UpdateRoomPayload
  ): Promise<ApiResponse<Room>> {
    const res = await apiClient.patch<ApiResponse<Room>>(`/rooms/${id}`, data);
    return res.data;
  },

  async deleteRoom(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/rooms/${id}`);
    return res.data;
  },
};
