import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, ActivityLogDTO, PaginatedResponse } from '@/types';

const ACTIVITY_QUERY_KEY = ['activity'];

export function useActivityLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...ACTIVITY_QUERY_KEY, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ActivityLogDTO>>(
        `/activity?page=${page}&limit=${limit}`
      );
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
