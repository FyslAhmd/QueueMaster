'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import {
  Activity,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useActivityLogs } from '@/hooks';
import {
  Button,
  Select,
  Input,
  PageLoader,
  EmptyState,
  Badge,
  Pagination,
} from '@/components/ui';
import { ActivityLogDTO } from '@/types';

const actionIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: CheckCircle,
  cancelled: XCircle,
  assigned: User,
  added: Clock,
};

const actionColors: Record<string, string> = {
  created: 'from-emerald-500 to-green-600',
  updated: 'from-sky-500 to-blue-600',
  deleted: 'from-red-500 to-rose-600',
  completed: 'from-emerald-500 to-green-600',
  cancelled: 'from-red-500 to-rose-600',
  assigned: 'from-teal-500 to-emerald-600',
  added: 'from-amber-500 to-orange-600',
};

const entityLabels: Record<string, string> = {
  appointment: 'Appointment',
  staff: 'Staff',
  service: 'Service',
  queue: 'Queue',
  user: 'User',
};

const actionLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  completed: 'Completed',
  cancelled: 'Cancelled',
  assigned: 'Assigned',
  added: 'Added',
};

export default function ActivityPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const itemsPerPage = 20;

  const { data: response, isLoading, refetch } = useActivityLogs(currentPage, itemsPerPage);
  const activities = response?.data || [];
  const pagination = response?.pagination;

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    return activities.filter((activity: ActivityLogDTO & { actionType?: string }) => {
      // Match action type: 'created' matches filter 'created', etc.
      const activityActionType = activity.actionType || activity.action.split('_').pop() || '';
      const matchesAction = actionFilter === 'all' || activityActionType === actionFilter;
      
      // Match entity type: 'appointment' matches filter 'appointment', etc.
      const activityEntityType = activity.entityType || activity.action.split('_').slice(0, -1).join('_') || '';
      const matchesEntity = entityFilter === 'all' || activityEntityType === entityFilter;
      
      // Match date
      const matchesDate = !dateFilter || 
        format(parseISO(activity.createdAt), 'yyyy-MM-dd') === dateFilter;
      
      return matchesAction && matchesEntity && matchesDate;
    });
  }, [activities, actionFilter, entityFilter, dateFilter]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityLogDTO[]> = {};
    filteredActivities.forEach((activity) => {
      const date = format(parseISO(activity.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  const getDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getActionType = (activity: ActivityLogDTO & { actionType?: string }): string => {
    return activity.actionType || activity.action.split('_').pop() || 'unknown';
  };

  const getActionIcon = (actionType: string) => {
    const Icon = actionIcons[actionType] || Activity;
    return Icon;
  };

  const getActionColor = (actionType: string): string => {
    return actionColors[actionType] || 'from-slate-500 to-slate-600';
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Activity Log</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Track all changes and actions in the system
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="font-medium text-slate-800">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Action"
            options={[
              { value: 'all', label: 'All Actions' },
              { value: 'created', label: 'Created' },
              { value: 'updated', label: 'Updated' },
              { value: 'deleted', label: 'Deleted' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'added', label: 'Added to Queue' },
              { value: 'assigned', label: 'Assigned' },
            ]}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
          <Select
            label="Entity Type"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'appointment', label: 'Appointments' },
              { value: 'staff', label: 'Staff' },
              { value: 'service', label: 'Services' },
              { value: 'queue', label: 'Queue' },
            ]}
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {(actionFilter !== 'all' || entityFilter !== 'all' || dateFilter) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActionFilter('all');
                setEntityFilter('all');
                setDateFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity found"
          description={
            activities?.length === 0
              ? 'Activity will appear here as you use the system'
              : 'No activities match your current filters'
          }
          action={
            activities?.length !== 0 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setActionFilter('all');
                  setEntityFilter('all');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-slate-500 mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-sm py-2 -mx-1 px-1 rounded">
                {getDateLabel(date)}
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {dayActivities.map((activity, index) => {
                    const actionType = getActionType(activity as ActivityLogDTO & { actionType?: string });
                    const Icon = getActionIcon(actionType);
                    const colorClass = getActionColor(actionType);
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-start gap-3 sm:gap-4"
                      >
                        {/* Timeline dot */}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center text-white shadow-md`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          {index < dayActivities.length - 1 && (
                            <div className="absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-200" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge
                                    variant={
                                      activity.action === 'delete' || activity.action === 'cancel'
                                        ? 'error'
                                        : activity.action === 'create'
                                        ? 'success'
                                        : 'info'
                                    }
                                  >
                                    {actionLabels[activity.action] || activity.action}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    {entityLabels[activity.entityType] || activity.entityType}
                                  </span>
                                </div>
                                <p className="font-medium text-slate-800">{activity.description}</p>
                                {activity.user && (
                                  <p className="text-sm text-slate-500 mt-1">
                                    by {activity.user.name}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 whitespace-nowrap">
                                {format(parseISO(activity.createdAt), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
