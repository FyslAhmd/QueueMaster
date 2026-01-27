import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '@/lib/api';
import { AppointmentDTO, ApiResponse, PaginatedResponse } from '@/types';
import { CreateAppointmentInput, UpdateAppointmentInput } from '@/lib/validations/appointment';
import toast from 'react-hot-toast';

const APPOINTMENTS_QUERY_KEY = ['appointments'];

interface AppointmentFilters {
  date?: string;
  staffId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Helper to combine date and time into ISO string
function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.date) params.set('date', filters.date);
      if (filters.staffId) params.set('staffId', filters.staffId);
      if (filters.status) params.set('status', filters.status);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());

      const { data } = await api.get<PaginatedResponse<AppointmentDTO>>(
        `/appointments?${params.toString()}`
      );
      return data;
    },
  });
}

export function useAppointmentById(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AppointmentDTO>>(`/appointments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      // Transform date + time to startTime for API
      const apiInput = {
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        serviceId: input.serviceId,
        staffId: input.staffId,
        notes: input.notes,
        startTime: combineDateTime(input.date, input.time),
      };
      
      const { data } = await api.post<ApiResponse<AppointmentDTO & { addedToQueue?: boolean }>>(
        '/appointments',
        apiInput
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      
      if (data.data?.addedToQueue) {
        toast.success(data.message || 'Appointment added to waiting queue');
      } else {
        toast.success(data.message || 'Appointment created successfully');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAppointmentInput & { id: string }) => {
      // Transform date + time to startTime if provided
      const apiInput: Record<string, unknown> = { ...input };
      if (input.date && input.time) {
        apiInput.startTime = combineDateTime(input.date, input.time);
        delete apiInput.date;
        delete apiInput.time;
      }
      
      const { data } = await api.put<ApiResponse<AppointmentDTO>>(`/appointments/${id}`, apiInput);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(data.message || 'Appointment updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse>(`/appointments/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(data.message || 'Appointment cancelled successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
