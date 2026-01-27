'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isTomorrow, isPast, startOfDay, addDays } from 'date-fns';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
} from 'lucide-react';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useStaff,
  useServices,
} from '@/hooks';
import {
  createAppointmentSchema,
  CreateAppointmentInput,
} from '@/lib/validations/appointment';
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  PageLoader,
  EmptyState,
  Badge,
  ProgressBar,
} from '@/components/ui';
import { AppointmentDTO, StaffDTO } from '@/types';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9; // 9 AM to 6 PM
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return { value: time, label: time };
});

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: appointmentsResponse, isLoading: appointmentsLoading } = useAppointments({
    date: dateFilter || undefined,
  });
  const appointments = appointmentsResponse?.data || [];
  
  const { data: staff } = useStaff();
  const { data: services } = useServices();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
  });

  const selectedStaffId = watch('staffId');
  const selectedDate = watch('date');

  // Get staff availability info
  const staffOptions = useMemo(() => {
    if (!staff) return [];
    return staff
      .filter((s) => s.status === 'available')
      .map((s) => ({
        value: s.id,
        label: `${s.name} - ${s.serviceType} (${s.todayAppointments || 0}/${s.dailyCapacity})`,
        disabled: (s.todayAppointments || 0) >= s.dailyCapacity,
      }));
  }, [staff]);

  const serviceOptions = useMemo(() => {
    if (!services) return [];
    return services
      .filter((s) => s.status === 'active')
      .map((s) => ({
        value: s.id,
        label: `${s.name} (${s.duration} min)`,
      }));
  }, [services]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return appointments.filter((apt) => {
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.customerPhone?.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingAppointment(null);
    reset({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      staffId: '',
      serviceId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      notes: '',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: AppointmentDTO) => {
    setEditingAppointment(appointment);
    const appointmentDate = parseISO(appointment.startTime);
    reset({
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail || '',
      staffId: appointment.staff?.id || '',
      serviceId: appointment.service?.id || '',
      date: format(appointmentDate, 'yyyy-MM-dd'),
      time: format(appointmentDate, 'HH:mm'),
      notes: appointment.notes || '',
      status: appointment.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    reset();
  };

  const onSubmit = async (data: CreateAppointmentInput) => {
    if (editingAppointment) {
      await updateMutation.mutateAsync({ id: editingAppointment.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (appointment: AppointmentDTO, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    await updateMutation.mutateAsync({ id: appointment.id, status });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return <Badge variant={variants[status] || 'neutral'}>{status}</Badge>;
  };

  const getDateLabel = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'N/A';
    const date = parseISO(dateTimeStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  if (appointmentsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Schedule and manage appointments</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 text-sm bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            appointments?.length === 0
              ? 'Schedule your first appointment to get started'
              : 'No appointments match your current filters'
          }
          action={
            appointments?.length === 0 ? (
              <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                New Appointment
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Time & Date */}
                  <div className="shrink-0 lg:w-32 text-center lg:text-left">
                    <div className="text-2xl font-bold text-teal-600">
                      {appointment.startTime ? format(parseISO(appointment.startTime), 'HH:mm') : 'N/A'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getDateLabel(appointment.startTime)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block w-px h-16 bg-slate-200" />

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-slate-800">{appointment.customerName}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{appointment.customerPhone}</span>
                      {appointment.customerEmail && <span>{appointment.customerEmail}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      {appointment.service && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appointment.service.name}
                        </span>
                      )}
                      {appointment.staff && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {appointment.staff.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {appointment.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(appointment, 'confirmed')}
                        leftIcon={<CheckCircle className="w-4 h-4 text-green-400" />}
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(appointment, 'completed')}
                        leftIcon={<CheckCircle className="w-4 h-4 text-green-400" />}
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(appointment)}
                      leftIcon={<Edit2 className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    {appointment.status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(appointment.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">Notes: </span>
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              error={errors.customerName?.message}
              required
              {...register('customerName')}
            />
            <Input
              label="Phone Number"
              placeholder="+1234567890"
              error={errors.customerPhone?.message}
              required
              {...register('customerPhone')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="customer@email.com"
            error={errors.customerEmail?.message}
            {...register('customerEmail')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="serviceId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Service"
                  options={[{ value: '', label: 'Select a service' }, ...serviceOptions]}
                  error={errors.serviceId?.message}
                  required
                  {...field}
                />
              )}
            />
            <Controller
              name="staffId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Staff Member"
                  options={[{ value: '', label: 'Select staff (optional)' }, ...staffOptions]}
                  error={errors.staffId?.message}
                  helperText="If not selected, customer will be added to queue"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              error={errors.date?.message}
              required
              {...register('date')}
            />
            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <Select
                  label="Time"
                  options={timeSlots}
                  error={errors.time?.message}
                  required
                  {...field}
                />
              )}
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="Any special requirements or notes..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />

          {editingAppointment && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={statusOptions.filter((o) => o.value !== 'all')}
                  error={errors.status?.message}
                  {...field}
                />
              )}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingAppointment ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Cancel Appointment"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Keep
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            isLoading={deleteMutation.isPending}
          >
            Cancel Appointment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
