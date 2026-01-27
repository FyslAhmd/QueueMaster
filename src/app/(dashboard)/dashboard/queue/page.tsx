'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
  Users,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  useQueue,
  useAutoAssignQueue,
  useManualAssignQueue,
  useStaff,
} from '@/hooks';
import {
  Button,
  Select,
  Modal,
  PageLoader,
  EmptyState,
  Badge,
  ProgressBar,
} from '@/components/ui';
import { WaitingQueueDTO, StaffDTO } from '@/types';

export default function QueuePage() {
  const [selectedQueue, setSelectedQueue] = useState<WaitingQueueDTO | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const { data: queue, isLoading: queueLoading, refetch } = useQueue();
  const { data: staff } = useStaff();
  const autoAssignMutation = useAutoAssignQueue();
  const manualAssignMutation = useManualAssignQueue();

  const availableStaff = staff?.filter(
    (s) => s.status === 'available' && (s.todayAppointments || 0) < s.dailyCapacity
  );

  const handleAutoAssign = async () => {
    await autoAssignMutation.mutateAsync();
  };

  const openAssignModal = (queueItem: WaitingQueueDTO) => {
    setSelectedQueue(queueItem);
    setSelectedStaffId('');
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedQueue(null);
    setSelectedStaffId('');
  };

  const handleManualAssign = async () => {
    if (!selectedQueue || !selectedStaffId) return;
    await manualAssignMutation.mutateAsync({
      queueId: selectedQueue.id,
      staffId: selectedStaffId,
    });
    closeAssignModal();
  };

  const getWaitTime = (addedAt: string) => {
    return formatDistanceToNow(parseISO(addedAt), { addSuffix: false });
  };

  if (queueLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Waiting Queue</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            {queue?.length || 0} customers waiting
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={handleAutoAssign}
            isLoading={autoAssignMutation.isPending}
            disabled={!queue?.length || !availableStaff?.length}
            leftIcon={<ArrowRight className="w-4 h-4" />}
          >
            Auto-Assign All
          </Button>
        </div>
      </div>

      {/* Staff Availability Summary */}
      {availableStaff && availableStaff.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <User className="w-5 h-5 text-teal-600" />
            Available Staff
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {availableStaff.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Capacity</span>
                  <span className="text-slate-700">
                    {member.todayAppointments || 0}/{member.dailyCapacity}
                  </span>
                </div>
                <ProgressBar
                  value={member.todayAppointments || 0}
                  max={member.dailyCapacity}
                  color="primary"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue List */}
      {queue && queue.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Queue is empty"
          description="No customers are currently waiting in the queue"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {queue?.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Position */}
                  <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    #{item.position}
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-slate-800">
                        {item.appointment?.customerName || 'Unknown'}
                      </h3>
                      <Badge variant="warning">Waiting</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Waiting for {getWaitTime(item.addedAt)}
                      </span>
                      {item.appointment?.service && (
                        <span>{item.appointment.service.name}</span>
                      )}
                      {item.appointment?.customerPhone && (
                        <span>{item.appointment.customerPhone}</span>
                      )}
                    </div>
                    {item.appointment?.dateTime && (
                      <p className="text-xs text-slate-400 mt-1">
                        Requested: {format(new Date(item.appointment.dateTime), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <Button
                      onClick={() => openAssignModal(item)}
                      disabled={!availableStaff?.length}
                      leftIcon={<User className="w-4 h-4" />}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Available Staff Warning */}
      {queue && queue.length > 0 && (!availableStaff || availableStaff.length === 0) && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">No Available Staff</h3>
              <p className="text-sm text-amber-700 mt-1">
                All staff members are either at capacity or on leave. 
                Add more staff or increase capacity to serve waiting customers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        title="Assign to Staff"
        size="md"
      >
        <div className="space-y-5">
          {selectedQueue && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500">Customer</p>
              <p className="font-semibold text-slate-800">
                {selectedQueue.appointment?.customerName}
              </p>
              {selectedQueue.appointment?.service && (
                <p className="text-sm text-slate-500 mt-2">
                  Service: {selectedQueue.appointment.service.name}
                </p>
              )}
            </div>
          )}

          <Select
            label="Select Staff Member"
            options={[
              { value: '', label: 'Choose a staff member' },
              ...(availableStaff?.map((s) => ({
                value: s.id,
                label: `${s.name} - ${s.serviceType} (${s.todayAppointments || 0}/${s.dailyCapacity} appointments)`,
              })) || []),
            ]}
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeAssignModal}>
              Cancel
            </Button>
            <Button
              onClick={handleManualAssign}
              isLoading={manualAssignMutation.isPending}
              disabled={!selectedStaffId}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
