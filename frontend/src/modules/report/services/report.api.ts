import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  SalesReportParams,
  SalesReportResponseDto,
  OccupancyMatrixParams,
  OccupancyMatrixResponseDto,
} from '../report.types';

export const reportApi = {
  async getSalesReport(params: SalesReportParams = {}): Promise<ApiResponse<SalesReportResponseDto>> {
    const res = await apiClient.get<ApiResponse<SalesReportResponseDto>>('/reports/sales', {
      params,
    });
    return res.data;
  },

  async getOccupancyMatrix(params: OccupancyMatrixParams = {}): Promise<ApiResponse<OccupancyMatrixResponseDto>> {
    const res = await apiClient.get<ApiResponse<OccupancyMatrixResponseDto>>('/reports/occupancy', {
      params,
    });
    return res.data;
  },
};
