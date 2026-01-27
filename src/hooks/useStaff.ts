import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '@/lib/api';
import { StaffDTO, ApiResponse } from '@/types';
import { CreateStaffInput, UpdateStaffInput } from '@/lib/validations/staff';
import toast from 'react-hot-toast';

const STAFF_QUERY_KEY = ['staff'];

export function useStaff() {
  return useQuery({
    queryKey: STAFF_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<StaffDTO[]>>('/staff');
      return data.data || [];
    },
  });
}

export function useStaffById(id: string) {
  return useQuery({
    queryKey: [...STAFF_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<StaffDTO>>(`/staff/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      const { data } = await api.post<ApiResponse<StaffDTO>>('/staff', input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      toast.success(data.message || 'Staff member created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateStaffInput & { id: string }) => {
      const { data } = await api.put<ApiResponse<StaffDTO>>(`/staff/${id}`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      toast.success(data.message || 'Staff member updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse>(`/staff/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY });
      toast.success(data.message || 'Staff member deleted successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
