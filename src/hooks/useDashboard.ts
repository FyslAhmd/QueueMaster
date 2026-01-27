import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, DashboardStats, StaffLoadSummary } from '@/types';

const DASHBOARD_QUERY_KEY = ['dashboard'];

interface DashboardData {
  stats: DashboardStats;
  staffLoadSummary: StaffLoadSummary[];
  upcomingAppointments: {
    id: string;
    customerName: string;
    staffName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
  }[];
}

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>('/dashboard');
      return data.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
