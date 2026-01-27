import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '@/lib/api';
import { WaitingQueueDTO, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

const QUEUE_QUERY_KEY = ['queue'];

export function useQueue() {
  return useQuery({
    queryKey: QUEUE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WaitingQueueDTO[]>>('/queue');
      return data.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

interface AssignFromQueueInput {
  queueId?: string;
  staffId?: string;
  autoAssign?: boolean;
}

interface AssignmentResult {
  appointmentId: string;
  staffId: string;
  staffName: string;
  customerName: string;
}

export function useAssignFromQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AssignFromQueueInput) => {
      const { data } = await api.post<ApiResponse<AssignmentResult>>('/queue', input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(data.message || 'Appointment assigned successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// Auto-assign all queue items to available staff
export function useAutoAssignQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<{ assigned: number }>>('/queue', {
        autoAssign: true,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(data.message || 'Queue auto-assigned successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

// Manually assign specific queue item to staff
export function useManualAssignQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ queueId, staffId }: { queueId: string; staffId: string }) => {
      const { data } = await api.post<ApiResponse<AssignmentResult>>('/queue', {
        queueId,
        staffId,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUEUE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success(data.message || 'Customer assigned successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
