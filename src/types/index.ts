import { Types } from 'mongoose';

// User Types
export type UserRole = 'admin' | 'user';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Staff Types
export type StaffStatus = 'available' | 'on_leave';

export interface IStaff {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffDTO {
  id: string;
  name: string;
  serviceType: string;
  dailyCapacity: number;
  status: StaffStatus;
  todayAppointments?: number;
  createdAt: string;
}

// Service Types
export interface IService {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  duration: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceStatus = 'active' | 'inactive';

export interface ServiceDTO {
  id: string;
  name: string;
  description?: string;
  duration: number;
  status: ServiceStatus;
  createdAt: string;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IAppointment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  staffId?: Types.ObjectId;
  serviceId: Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  slotKey?: string; // For conflict prevention: staffId_date_time
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDTO {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  startTime: string;  // ISO string
  endTime?: string;   // ISO string
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  staffId?: string | null;
  staffName?: string | null;
  serviceId?: string;
  serviceName?: string;
  staff?: {
    id: string;
    name: string;
    serviceType: string;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
  };
}

// Queue Types
export type QueueStatus = 'waiting' | 'assigned';

export interface IWaitingQueue {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  position: number;
  status: QueueStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueDTO {
  id: string;
  appointmentId: string;
  position: number;
  status: QueueStatus;
  customerName: string;
  serviceName: string;
  requestedTime: string;
  createdAt: string;
}

// Waiting Queue DTO with full appointment details
export interface WaitingQueueDTO {
  id: string;
  position: number;
  status: QueueStatus;
  addedAt: string;
  appointment?: {
    id: string;
    customerName: string;
    customerPhone: string;
    dateTime: string;
    service?: {
      id: string;
      name: string;
      duration: number;
    };
  };
}

// Activity Log Types
export type ActivityAction = 
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'queue_added'
  | 'queue_assigned'
  | 'staff_created'
  | 'staff_updated'
  | 'staff_deleted'
  | 'service_created'
  | 'service_updated'
  | 'service_deleted';

export interface IActivityLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ActivityLogDTO {
  id: string;
  action: string;
  actionType: string;   // e.g., 'created', 'updated', 'deleted'
  entityType: string;   // e.g., 'appointment', 'staff', 'service'
  entityId?: string;
  description: string;
  details?: string;
  createdAt: string;
  time?: string;
  metadata?: Record<string, unknown>;
  user?: {
    id: string;
    name: string;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalAppointmentsToday: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  waitingQueueCount: number;
  completionRate: number;
}

export interface StaffLoadSummary {
  id: string;
  name: string;
  serviceType: string;
  todayAppointments: number;
  dailyCapacity: number;
  status: StaffStatus;
  loadPercentage: number;
  loadStatus: 'ok' | 'warning' | 'full';
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
