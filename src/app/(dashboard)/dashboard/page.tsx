'use client';

import { Calendar, Users, CheckCircle, Clock, ClipboardList, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useDashboard, useActivityLogs, useQueue } from '@/hooks';
import { StatCard, PageLoader, Badge, ProgressBar, EmptyState, Button } from '@/components/ui';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: activityData, isLoading: isActivityLoading } = useActivityLogs(1, 5);
  const { data: queueData } = useQueue();

  if (isDashboardLoading) {
    return <PageLoader />;
  }

  const stats = dashboardData?.stats;
  const staffLoad = dashboardData?.staffLoadSummary || [];
  const upcoming = dashboardData?.upcomingAppointments || [];
  const activities = activityData?.data || [];
  const queueCount = queueData?.length || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Overview of your appointments and queue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Today's Appointments"
          value={stats?.totalAppointmentsToday || 0}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats?.completedAppointments || 0}
          subtitle={`${stats?.completionRate || 0}% completion rate`}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingAppointments || 0}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Waiting Queue"
          value={queueCount}
          icon={ClipboardList}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Staff Load Summary */}
        <div className="xl:col-span-2 h-87">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Staff Load Today</h2>
              <Link href="/dashboard/staff" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {staffLoad.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={Users}
                  title="No staff members"
                  description="Add staff members to see their workload"
                  action={
                    <Link href="/dashboard/staff">
                      <Button size="sm">Add Staff</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {staffLoad.slice(0, 4).map((staff) => (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-semibold shrink-0 text-white shadow-md">
                      {staff.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate text-slate-800 text-sm">{staff.name}</p>
                        <Badge
                          variant={
                            staff.status === 'on_leave'
                              ? 'warning'
                              : staff.loadStatus === 'full'
                              ? 'error'
                              : staff.loadStatus === 'warning'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {staff.status === 'on_leave'
                            ? 'On Leave'
                            : staff.loadStatus === 'full'
                            ? 'Full'
                            : staff.loadStatus === 'warning'
                            ? 'Busy'
                            : 'OK'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={staff.todayAppointments}
                          max={staff.dailyCapacity}
                          color={
                            staff.loadStatus === 'full'
                              ? 'error'
                              : staff.loadStatus === 'warning'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        />
                        <span className="text-xs text-slate-500 shrink-0">
                          {staff.todayAppointments}/{staff.dailyCapacity}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="h-87">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Recent Activity</h2>
              <Link href="/dashboard/activity" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8 flex-1 flex items-center justify-center">No recent activity</p>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <span className="text-xs text-teal-600 font-medium shrink-0 w-12">
                      {format(new Date(activity.createdAt), 'HH:mm')}
                    </span>
                    <Badge 
                      variant={
                        activity.action.includes('create') ? 'success' :
                        activity.action.includes('update') ? 'info' :
                        activity.action.includes('delete') || activity.action.includes('cancel') ? 'error' :
                        'neutral'
                      }
                    >
                      {activity.action.replace(/_/g, ' ')}
                    </Badge>
                    <p className="text-xs text-slate-600 truncate flex-1">{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Upcoming Appointments</h2>
          <Link href="/dashboard/appointments" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="Create your first appointment to get started"
            action={
              <Link href="/dashboard/appointments">
                <Button size="sm">Create Appointment</Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Service</th>
                    <th className="pb-3 font-medium">Staff</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-slate-800 font-medium">{appointment.customerName}</td>
                      <td className="py-3 text-slate-600">{appointment.serviceName}</td>
                      <td className="py-3">
                        <Badge variant={appointment.staffName === 'Unassigned' ? 'warning' : 'info'}>
                          {appointment.staffName}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-600">
                        {format(new Date(appointment.startTime), 'h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {upcoming.map((appointment) => (
                <div key={appointment.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-800">{appointment.customerName}</p>
                      <p className="text-sm text-slate-500">{appointment.serviceName}</p>
                    </div>
                    <span className="text-sm font-medium text-teal-600">
                      {format(new Date(appointment.startTime), 'h:mm a')}
                    </span>
                  </div>
                  <Badge variant={appointment.staffName === 'Unassigned' ? 'warning' : 'info'}>
                    {appointment.staffName}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
