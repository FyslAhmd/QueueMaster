'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, MoreVertical } from 'lucide-react';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/hooks';
import { createStaffSchema, CreateStaffInput, UpdateStaffInput } from '@/lib/validations/staff';
import {
  Button,
  Input,
  Select,
  Modal,
  PageLoader,
  EmptyState,
  Badge,
  ProgressBar,
} from '@/components/ui';
import { StaffDTO } from '@/types';

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: staff, isLoading } = useStaff();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      dailyCapacity: 5,
      status: 'available',
    },
  });

  const openCreateModal = () => {
    setEditingStaff(null);
    reset({
      name: '',
      serviceType: '',
      dailyCapacity: 5,
      status: 'available',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staffMember: StaffDTO) => {
    setEditingStaff(staffMember);
    reset({
      name: staffMember.name,
      serviceType: staffMember.serviceType,
      dailyCapacity: staffMember.dailyCapacity,
      status: staffMember.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    reset();
  };

  const onSubmit = async (data: CreateStaffInput) => {
    if (editingStaff) {
      await updateMutation.mutateAsync({ id: editingStaff.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (staffMember: StaffDTO) => {
    await updateMutation.mutateAsync({
      id: staffMember.id,
      status: staffMember.status === 'available' ? 'on_leave' : 'available',
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your staff members and availability</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      {staff && staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members yet"
          description="Add your first staff member to start scheduling appointments"
          action={
            <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Add Staff Member
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {staff?.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-lg font-semibold text-white shadow-md">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.serviceType}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'available' ? 'success' : 'warning'}>
                    {member.status === 'available' ? 'Available' : 'On Leave'}
                  </Badge>
                </div>

                {/* Today's Load */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Today&apos;s Appointments</span>
                    <span className="font-medium text-slate-700">
                      {member.todayAppointments || 0} / {member.dailyCapacity}
                    </span>
                  </div>
                  <ProgressBar
                    value={member.todayAppointments || 0}
                    max={member.dailyCapacity}
                    color={
                      (member.todayAppointments || 0) >= member.dailyCapacity
                        ? 'error'
                        : (member.todayAppointments || 0) >= member.dailyCapacity * 0.8
                        ? 'warning'
                        : 'success'
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(member)}
                    disabled={updateMutation.isPending}
                  >
                    {member.status === 'available' ? 'Set On Leave' : 'Set Available'}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(member)}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(member.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Name"
            placeholder="Enter staff name"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="Service Type"
            placeholder="e.g., Doctor, Consultant, Support Agent"
            error={errors.serviceType?.message}
            required
            {...register('serviceType')}
          />

          <Input
            label="Daily Capacity"
            type="number"
            placeholder="5"
            error={errors.dailyCapacity?.message}
            helperText="Maximum appointments per day"
            required
            {...register('dailyCapacity', { valueAsNumber: true })}
          />

          <Select
            label="Status"
            options={[
              { value: 'available', label: 'Available' },
              { value: 'on_leave', label: 'On Leave' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingStaff ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Staff Member"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete this staff member? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
