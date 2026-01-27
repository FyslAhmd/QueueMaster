'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Clock, DollarSign, Briefcase } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks';
import { createServiceSchema, CreateServiceInput } from '@/lib/validations/service';
import {
  Button,
  Input,
  Textarea,
  Modal,
  PageLoader,
  EmptyState,
  Badge,
} from '@/components/ui';
import { ServiceDTO } from '@/types';

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: services, isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      duration: 30,
      status: 'active',
    },
  });

  const openCreateModal = () => {
    setEditingService(null);
    reset({
      name: '',
      description: '',
      duration: 30,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceDTO) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      status: service.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data: CreateServiceInput) => {
    if (editingService) {
      await updateMutation.mutateAsync({ id: editingService.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (service: ServiceDTO) => {
    await updateMutation.mutateAsync({
      id: service.id,
      status: service.status === 'active' ? 'inactive' : 'active',
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Services</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your services and their durations</p>
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Service
        </Button>
      </div>

      {/* Services List */}
      {services && services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          description="Add your first service to start accepting appointments"
          action={
            <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {services?.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{service.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={service.status === 'active' ? 'success' : 'warning'}>
                    {service.status}
                  </Badge>
                </div>

                {service.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(service)}
                    disabled={updateMutation.isPending}
                  >
                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(service)}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(service.id)}
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
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Service Name"
            placeholder="e.g., Consultation, Follow-up, Therapy"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Textarea
            label="Description"
            placeholder="Brief description of the service"
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="30"
            error={errors.duration?.message}
            helperText="How long does this service typically take?"
            required
            {...register('duration', { valueAsNumber: true })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingService ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Service"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete this service? This action cannot be undone.
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
