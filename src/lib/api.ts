import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    const errors = error.response?.data?.errors;
    
    return Promise.reject({
      message,
      errors,
      status: error.response?.status || 500,
    });
  }
);

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
  status: number;
}

export default api;
