import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment, Staff, WaitingQueue } from '@/models';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse } from '@/lib/errors';
import { startOfDay, endOfDay } from 'date-fns';

// GET dashboard stats
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get appointment counts for today
    const [totalToday, completed, cancelled, noShow] = await Promise.all([
      Appointment.countDocuments({
        userId,
        startTime: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: ['cancelled'] },
      }),
      Appointment.countDocuments({
        userId,
        startTime: { $gte: todayStart, $lte: todayEnd },
        status: 'completed',
      }),
      Appointment.countDocuments({
        userId,
        startTime: { $gte: todayStart, $lte: todayEnd },
        status: 'cancelled',
      }),
      Appointment.countDocuments({
        userId,
        startTime: { $gte: todayStart, $lte: todayEnd },
        status: 'no_show',
      }),
    ]);

    const pending = totalToday - completed - noShow;
    const completionRate = totalToday > 0 ? Math.round((completed / totalToday) * 100) : 0;

    // Get waiting queue count
    const waitingQueueCount = await WaitingQueue.countDocuments({
      userId,
      status: 'waiting',
    });

    // Get staff load summary
    const allStaff = await Staff.find({ userId });
    
    const staffLoadSummary = await Promise.all(
      allStaff.map(async (staff) => {
        const todayAppointments = await Appointment.countDocuments({
          staffId: staff._id,
          startTime: { $gte: todayStart, $lte: todayEnd },
          status: { $nin: ['cancelled', 'no_show'] },
        });

        const loadPercentage = Math.round((todayAppointments / staff.dailyCapacity) * 100);
        let loadStatus: 'ok' | 'warning' | 'full' = 'ok';
        
        if (loadPercentage >= 100) {
          loadStatus = 'full';
        } else if (loadPercentage >= 80) {
          loadStatus = 'warning';
        }

        return {
          id: staff._id.toString(),
          name: staff.name,
          serviceType: staff.serviceType,
          todayAppointments,
          dailyCapacity: staff.dailyCapacity,
          status: staff.status,
          loadPercentage: Math.min(loadPercentage, 100),
          loadStatus,
        };
      })
    );

    // Get upcoming appointments for today
    const upcomingAppointments = await Appointment.find({
      userId,
      startTime: { $gte: new Date(), $lte: todayEnd },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('staffId', 'name')
      .populate('serviceId', 'name duration')
      .sort({ startTime: 1 })
      .limit(10);

    const upcomingDTO = upcomingAppointments.map((a) => ({
      id: a._id.toString(),
      customerName: a.customerName,
      staffName: (a.staffId as unknown as { name: string })?.name || 'Unassigned',
      serviceName: (a.serviceId as unknown as { name: string })?.name || '',
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAppointmentsToday: totalToday,
          completedAppointments: completed,
          pendingAppointments: pending,
          cancelledAppointments: cancelled,
          noShowAppointments: noShow,
          waitingQueueCount,
          completionRate,
        },
        staffLoadSummary,
        upcomingAppointments: upcomingDTO,
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
