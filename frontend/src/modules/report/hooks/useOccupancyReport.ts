import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/report.api';
import { OccupancyMatrixParams } from '../report.types';

export function useOccupancyReport(params: OccupancyMatrixParams) {
  return useQuery({
    queryKey: ['occupancy-matrix', params],
    queryFn: async () => {
      const res = await reportApi.getOccupancyMatrix(params);
      return res.data;
    },
  });
}
