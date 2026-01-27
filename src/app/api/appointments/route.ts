import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment, Staff, Service, WaitingQueue, ActivityLog } from '@/models';
import { createAppointmentApiSchema } from '@/lib/validations/appointment';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError, NotFoundError, ConflictError } from '@/lib/errors';
import { startOfDay, endOfDay, addMinutes, parseISO } from 'date-fns';

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
      // New appointment starts during existing appointment
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New appointment ends during existing appointment
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New appointment completely contains existing appointment
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

// GET all appointments for current user
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = { userId };

    if (date) {
      const targetDate = parseISO(date);
      query.startTime = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    }

    if (staffId) {
      query.staffId = staffId;
    }

    if (status) {
      query.status = status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('staffId', 'name serviceType')
      .populate('serviceId', 'name duration')
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const appointmentsDTO = appointments.map((a) => {
      const staffData = a.staffId as unknown as { _id: { toString(): string }; name: string; serviceType?: string } | null;
      const serviceData = a.serviceId as unknown as { _id: { toString(): string }; name: string; duration: number } | null;
      
      return {
        id: a._id.toString(),
        staffId: staffData?._id?.toString() || null,
        staffName: staffData?.name || null,
        serviceId: serviceData?._id?.toString() || '',
        serviceName: serviceData?.name || '',
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        customerPhone: a.customerPhone,
        startTime: a.startTime.toISOString(),
        endTime: a.endTime.toISOString(),
        status: a.status,
        notes: a.notes,
        createdAt: a.createdAt.toISOString(),
        staff: staffData ? {
          id: staffData._id.toString(),
          name: staffData.name,
          serviceType: staffData.serviceType || '',
        } : undefined,
        service: serviceData ? {
          id: serviceData._id.toString(),
          name: serviceData.name,
          duration: serviceData.duration,
        } : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: appointmentsDTO,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// POST create new appointment
export const POST = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    const body = await request.json();

    // Validate input
    const validatedFields = createAppointmentApiSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const { customerName, customerEmail, customerPhone, serviceId, staffId, startTime, notes } = validatedFields.data;

    // Verify service exists and belongs to user
    const service = await Service.findOne({ _id: serviceId, userId });
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (service.status !== 'active') {
      throw new ValidationError('This service is not currently available');
    }

    const appointmentStartTime = parseISO(startTime);
    const appointmentEndTime = addMinutes(appointmentStartTime, service.duration);

    let assignedStaffId = staffId || null;
    let addedToQueue = false;

    // If staff is provided, validate and check conflicts
    if (staffId) {
      const staff = await Staff.findOne({ _id: staffId, userId });
      
      if (!staff) {
        throw new NotFoundError('Staff member not found');
      }

      if (staff.status === 'on_leave') {
        throw new ValidationError(`${staff.name} is currently on leave. Please select another staff member.`);
      }

      // Check for time conflicts
      const conflictCheck = await checkTimeConflict(staffId, appointmentStartTime, appointmentEndTime);
      if (conflictCheck.hasConflict) {
        throw new ConflictError(conflictCheck.conflictMessage!);
      }

      // Check daily capacity
      const capacityCheck = await checkStaffCapacity(staffId, appointmentStartTime);
      if (capacityCheck.exceeds) {
        throw new ValidationError(
          `${capacityCheck.staffName} already has ${capacityCheck.currentCount} appointments today (max: ${capacityCheck.capacity}). Please select another staff member or date.`
        );
      }
    } else {
      // No staff selected - will be added to queue
      addedToQueue = true;
      assignedStaffId = null;
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      staffId: assignedStaffId || undefined,
      serviceId,
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      status: 'pending',
      notes: notes || undefined,
    });

    // If no staff assigned, add to waiting queue
    if (addedToQueue) {
      // Get the next position in queue
      const lastQueueEntry = await WaitingQueue.findOne({ userId, status: 'waiting' })
        .sort({ position: -1 });
      const nextPosition = lastQueueEntry ? lastQueueEntry.position + 1 : 1;

      await WaitingQueue.create({
        userId,
        appointmentId: appointment._id,
        position: nextPosition,
        status: 'waiting',
      });

      // Log activity
      await ActivityLog.create({
        userId,
        action: 'queue_added',
        details: `Appointment for "${customerName}" added to waiting queue (Position: ${nextPosition})`,
        metadata: { appointmentId: appointment._id, position: nextPosition },
      });
    } else {
      // Log activity for direct assignment
      const staff = await Staff.findById(assignedStaffId);
      await ActivityLog.create({
        userId,
        action: 'appointment_created',
        details: `Appointment for "${customerName}" scheduled with ${staff?.name}`,
        metadata: { appointmentId: appointment._id, staffId: assignedStaffId },
      });
    }

    // Populate the response
    await appointment.populate('staffId', 'name serviceType');
    await appointment.populate('serviceId', 'name duration');

    return NextResponse.json(
      {
        success: true,
        message: addedToQueue
          ? 'No staff available. Appointment added to waiting queue.'
          : 'Appointment created successfully',
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
          addedToQueue,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
