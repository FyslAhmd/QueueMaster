import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Staff, Appointment, ActivityLog } from '@/models';
import { updateStaffSchema } from '@/lib/validations/staff';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError, NotFoundError, AuthorizationError } from '@/lib/errors';
import { startOfDay, endOfDay } from 'date-fns';

type RouteContext = { params: Promise<{ id: string }> };

// GET single staff by ID
export const GET = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;
    
    await dbConnect();

    const staff = await Staff.findById(id);

    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    if (staff.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to view this staff member');
    }

    // Get today's appointment count
    const today = new Date();
    const appointmentCount = await Appointment.countDocuments({
      staffId: staff._id,
      startTime: { $gte: startOfDay(today), $lte: endOfDay(today) },
      status: { $nin: ['cancelled', 'no_show'] },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: staff._id.toString(),
        name: staff.name,
        serviceType: staff.serviceType,
        dailyCapacity: staff.dailyCapacity,
        status: staff.status,
        todayAppointments: appointmentCount,
        createdAt: staff.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// PUT update staff
export const PUT = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validatedFields = updateStaffSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const staff = await Staff.findById(id);

    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    if (staff.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to update this staff member');
    }

    // Update staff
    Object.assign(staff, validatedFields.data);
    await staff.save();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'staff_updated',
      details: `Updated staff member "${staff.name}"`,
      metadata: { staffId: staff._id, changes: validatedFields.data },
    });

    // Get today's appointment count
    const today = new Date();
    const appointmentCount = await Appointment.countDocuments({
      staffId: staff._id,
      startTime: { $gte: startOfDay(today), $lte: endOfDay(today) },
      status: { $nin: ['cancelled', 'no_show'] },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        id: staff._id.toString(),
        name: staff.name,
        serviceType: staff.serviceType,
        dailyCapacity: staff.dailyCapacity,
        status: staff.status,
        todayAppointments: appointmentCount,
        createdAt: staff.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// DELETE staff
export const DELETE = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;

    await dbConnect();

    const staff = await Staff.findById(id);

    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    if (staff.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to delete this staff member');
    }

    const staffName = staff.name;
    await staff.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'staff_deleted',
      details: `Deleted staff member "${staffName}"`,
      metadata: { staffId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
