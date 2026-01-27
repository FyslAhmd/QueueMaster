import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { WaitingQueue, Appointment, Staff, ActivityLog } from '@/models';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, NotFoundError, ValidationError } from '@/lib/errors';
import { startOfDay, endOfDay } from 'date-fns';

// GET waiting queue for current user
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const queueEntries = await WaitingQueue.find({ userId, status: 'waiting' })
      .populate({
        path: 'appointmentId',
        populate: [
          { path: 'serviceId', select: 'name duration' },
        ],
      })
      .sort({ position: 1 });

    const queueDTO = queueEntries.map((entry) => {
      const appointment = entry.appointmentId as unknown as {
        _id: { toString(): string };
        customerName: string;
        customerPhone?: string;
        startTime: Date;
        serviceId: { name: string; duration: number };
      };

      return {
        id: entry._id.toString(),
        position: entry.position,
        status: entry.status,
        addedAt: entry.createdAt.toISOString(),
        appointment: {
          id: appointment._id.toString(),
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone || '',
          dateTime: appointment.startTime.toISOString(),
          service: appointment.serviceId ? {
            id: (appointment.serviceId as unknown as { _id: { toString(): string } })._id?.toString() || '',
            name: appointment.serviceId.name || '',
            duration: appointment.serviceId.duration || 0,
          } : undefined,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: queueDTO,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// POST assign from queue
export const POST = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    const body = await request.json();
    const { queueId, staffId, autoAssign } = body;

    await dbConnect();

    let queueEntry;
    let staff;

    if (autoAssign) {
      // Auto-assign: find the earliest queue entry and an available staff
      queueEntry = await WaitingQueue.findOne({ userId, status: 'waiting' })
        .populate({
          path: 'appointmentId',
          populate: { path: 'serviceId', select: 'name duration' },
        })
        .sort({ position: 1 });

      if (!queueEntry) {
        throw new NotFoundError('No appointments in the waiting queue');
      }

      // Find available staff with capacity
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      const availableStaff = await Staff.find({
        userId,
        status: 'available',
      });

      // Check each staff's capacity
      for (const s of availableStaff) {
        const appointmentCount = await Appointment.countDocuments({
          staffId: s._id,
          startTime: { $gte: todayStart, $lte: todayEnd },
          status: { $nin: ['cancelled'] },
        });

        if (appointmentCount < s.dailyCapacity) {
          staff = s;
          break;
        }
      }

      if (!staff) {
        throw new ValidationError('No available staff members with capacity. All staff are fully booked or on leave.');
      }
    } else {
      // Manual assign
      if (!queueId || !staffId) {
        throw new ValidationError('Queue ID and Staff ID are required for manual assignment');
      }

      queueEntry = await WaitingQueue.findOne({ _id: queueId, userId, status: 'waiting' })
        .populate({
          path: 'appointmentId',
          populate: { path: 'serviceId', select: 'name duration' },
        });

      if (!queueEntry) {
        throw new NotFoundError('Queue entry not found or already assigned');
      }

      staff = await Staff.findOne({ _id: staffId, userId });

      if (!staff) {
        throw new NotFoundError('Staff member not found');
      }

      if (staff.status === 'on_leave') {
        throw new ValidationError(`${staff.name} is currently on leave`);
      }

      // Check capacity
      const today = new Date();
      const appointmentCount = await Appointment.countDocuments({
        staffId: staff._id,
        startTime: { $gte: startOfDay(today), $lte: endOfDay(today) },
        status: { $nin: ['cancelled'] },
      });

      if (appointmentCount >= staff.dailyCapacity) {
        throw new ValidationError(`${staff.name} has reached their daily capacity (${staff.dailyCapacity} appointments)`);
      }
    }

    // Assign staff to the appointment
    const appointment = await Appointment.findById(queueEntry.appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    appointment.staffId = staff._id;
    await appointment.save();

    // Mark queue entry as assigned and remove
    queueEntry.status = 'assigned';
    await queueEntry.save();
    await queueEntry.deleteOne();

    // Reorder remaining queue positions
    const remainingQueue = await WaitingQueue.find({ userId, status: 'waiting' })
      .sort({ position: 1 });

    for (let i = 0; i < remainingQueue.length; i++) {
      remainingQueue[i].position = i + 1;
      await remainingQueue[i].save();
    }

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'queue_assigned',
      details: `Appointment for "${appointment.customerName}" assigned to ${staff.name} from queue`,
      metadata: { appointmentId: appointment._id, staffId: staff._id },
    });

    return NextResponse.json({
      success: true,
      message: `Appointment for "${appointment.customerName}" successfully assigned to ${staff.name}`,
      data: {
        appointmentId: appointment._id.toString(),
        staffId: staff._id.toString(),
        staffName: staff.name,
        customerName: appointment.customerName,
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
