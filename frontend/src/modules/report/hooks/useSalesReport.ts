import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/report.api';
import { SalesReportParams } from '../report.types';

export function useSalesReport(params: SalesReportParams) {
  return useQuery({
    queryKey: ['sales-report', params],
    queryFn: async () => {
      const res = await reportApi.getSalesReport(params);
      return res.data;
    },
  });
}
