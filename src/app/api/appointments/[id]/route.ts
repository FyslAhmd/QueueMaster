import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment, Staff, Service, WaitingQueue, ActivityLog } from '@/models';
import { updateAppointmentApiSchema } from '@/lib/validations/appointment';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError, NotFoundError, AuthorizationError, ConflictError } from '@/lib/errors';
import { startOfDay, endOfDay, addMinutes, parseISO } from 'date-fns';

type RouteContext = { params: Promise<{ id: string }> };

// Helper function to check for time conflicts
async function checkTimeConflict(
  staffId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<{ hasConflict: boolean; conflictMessage?: string }> {
  const query: Record<string, unknown> = {
    staffId,
    status: { $nin: ['cancelled', 'no_show'] },
    $or: [
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
    ],
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflictingAppointment = await Appointment.findOne(query);

  if (conflictingAppointment) {
    return {
      hasConflict: true,
      conflictMessage: 'This staff member already has an appointment at this time. Please pick another staff or change the time.',
    };
  }

  return { hasConflict: false };
}

// Helper function to check staff daily capacity
async function checkStaffCapacity(
  staffId: string,
  date: Date,
  excludeAppointmentId?: string
): Promise<{ exceeds: boolean; currentCount: number; capacity: number; staffName: string }> {
  const staff = await Staff.findById(staffId);
  
  if (!staff) {
    throw new NotFoundError('Staff member not found');
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const query: Record<string, unknown> = {
    staffId,
    startTime: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['cancelled', 'no_show'] },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const appointmentCount = await Appointment.countDocuments(query);

  return {
    exceeds: appointmentCount >= staff.dailyCapacity,
    currentCount: appointmentCount,
    capacity: staff.dailyCapacity,
    staffName: staff.name,
  };
}

// GET single appointment by ID
export const GET = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;

    await dbConnect();

    const appointment = await Appointment.findById(id)
      .populate('staffId', 'name serviceType')
      .populate('serviceId', 'name duration');

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to view this appointment');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: appointment._id.toString(),
        staffId: appointment.staffId?._id?.toString() || null,
        staffName: (appointment.staffId as unknown as { name: string })?.name || null,
        serviceId: appointment.serviceId._id.toString(),
        serviceName: (appointment.serviceId as unknown as { name: string })?.name || '',
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// PUT update appointment
export const PUT = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validatedFields = updateAppointmentApiSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to update this appointment');
    }

    if (appointment.status === 'cancelled') {
      throw new ValidationError('Cannot update a cancelled appointment');
    }

    const { customerName, customerEmail, customerPhone, serviceId, staffId, startTime, status, notes } = validatedFields.data;

    // Get current or new service for duration
    let service = await Service.findById(appointment.serviceId);
    if (serviceId && serviceId !== appointment.serviceId.toString()) {
      const newService = await Service.findOne({ _id: serviceId, userId });
      if (!newService) {
        throw new NotFoundError('Service not found');
      }
      if (newService.status !== 'active') {
        throw new ValidationError('This service is not currently available');
      }
      service = newService;
    }

    // Calculate new times if start time changes
    let newStartTime = appointment.startTime;
    let newEndTime = appointment.endTime;
    
    if (startTime) {
      newStartTime = parseISO(startTime);
      newEndTime = addMinutes(newStartTime, service!.duration);
    } else if (serviceId && serviceId !== appointment.serviceId.toString()) {
      // Service duration changed, recalculate end time
      newEndTime = addMinutes(appointment.startTime, service!.duration);
    }

    // If staff is being changed or time is being changed, check conflicts
    const newStaffId = staffId !== undefined ? (staffId || null) : appointment.staffId;
    
    if (newStaffId) {
      const staff = await Staff.findOne({ _id: newStaffId, userId });
      
      if (!staff) {
        throw new NotFoundError('Staff member not found');
      }

      if (staff.status === 'on_leave') {
        throw new ValidationError(`${staff.name} is currently on leave. Please select another staff member.`);
      }

      // Check for time conflicts (exclude current appointment)
      const conflictCheck = await checkTimeConflict(newStaffId.toString(), newStartTime, newEndTime, id);
      if (conflictCheck.hasConflict) {
        throw new ConflictError(conflictCheck.conflictMessage!);
      }

      // Check daily capacity (exclude current appointment)
      const capacityCheck = await checkStaffCapacity(newStaffId.toString(), newStartTime, id);
      if (capacityCheck.exceeds) {
        throw new ValidationError(
          `${capacityCheck.staffName} already has ${capacityCheck.currentCount} appointments today (max: ${capacityCheck.capacity}). Please select another staff member or date.`
        );
      }

      // If appointment was in queue and now has staff, remove from queue
      if (!appointment.staffId && newStaffId) {
        await WaitingQueue.deleteOne({ appointmentId: appointment._id });
        
        // Reorder remaining queue positions
        const remainingQueue = await WaitingQueue.find({ userId, status: 'waiting' })
          .sort({ position: 1 });
        
        for (let i = 0; i < remainingQueue.length; i++) {
          remainingQueue[i].position = i + 1;
          await remainingQueue[i].save();
        }
      }
    }

    // Update appointment
    if (customerName) appointment.customerName = customerName;
    if (customerEmail !== undefined) appointment.customerEmail = customerEmail || undefined;
    if (customerPhone !== undefined) appointment.customerPhone = customerPhone || undefined;
    if (serviceId) appointment.serviceId = serviceId as unknown as typeof appointment.serviceId;
    if (staffId !== undefined) appointment.staffId = staffId ? (staffId as unknown as typeof appointment.staffId) : undefined;
    if (startTime) {
      appointment.startTime = newStartTime;
      appointment.endTime = newEndTime;
    }
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes || undefined;

    await appointment.save();

    // Log activity based on status change
    if (status === 'cancelled') {
      await ActivityLog.create({
        userId,
        action: 'appointment_cancelled',
        details: `Appointment for "${appointment.customerName}" was cancelled`,
        metadata: { appointmentId: appointment._id },
      });
    } else if (status === 'completed') {
      await ActivityLog.create({
        userId,
        action: 'appointment_completed',
        details: `Appointment for "${appointment.customerName}" marked as completed`,
        metadata: { appointmentId: appointment._id },
      });
    } else {
      await ActivityLog.create({
        userId,
        action: 'appointment_updated',
        details: `Appointment for "${appointment.customerName}" was updated`,
        metadata: { appointmentId: appointment._id, changes: validatedFields.data },
      });
    }

    // Populate the response
    await appointment.populate('staffId', 'name serviceType');
    await appointment.populate('serviceId', 'name duration');

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        id: appointment._id.toString(),
        staffId: appointment.staffId?._id?.toString() || null,
        staffName: (appointment.staffId as unknown as { name: string })?.name || null,
        serviceId: appointment.serviceId._id.toString(),
        serviceName: (appointment.serviceId as unknown as { name: string })?.name || '',
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// DELETE appointment (soft delete by marking as cancelled)
export const DELETE = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;

    await dbConnect();

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to delete this appointment');
    }

    // Soft delete by marking as cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    // Remove from queue if exists
    await WaitingQueue.deleteOne({ appointmentId: appointment._id });

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'appointment_cancelled',
      details: `Appointment for "${appointment.customerName}" was cancelled`,
      metadata: { appointmentId: appointment._id },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
