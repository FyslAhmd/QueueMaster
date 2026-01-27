import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '@/lib/api';
import { ServiceDTO, ApiResponse } from '@/types';
import { CreateServiceInput, UpdateServiceInput } from '@/lib/validations/service';
import toast from 'react-hot-toast';

const SERVICES_QUERY_KEY = ['services'];

export function useServices(activeOnly = false) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, { activeOnly }],
    queryFn: async () => {
      const params = activeOnly ? '?active=true' : '';
      const { data } = await api.get<ApiResponse<ServiceDTO[]>>(`/services${params}`);
      return data.data || [];
    },
  });
}

export function useServiceById(id: string) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ServiceDTO>>(`/services/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const { data } = await api.post<ApiResponse<ServiceDTO>>('/services', input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      toast.success(data.message || 'Service created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateServiceInput & { id: string }) => {
      const { data } = await api.put<ApiResponse<ServiceDTO>>(`/services/${id}`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      toast.success(data.message || 'Service updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse>(`/services/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      toast.success(data.message || 'Service deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
