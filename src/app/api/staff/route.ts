import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Staff, Appointment } from '@/models';
import { createStaffSchema } from '@/lib/validations/staff';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError } from '@/lib/errors';
import { startOfDay, endOfDay } from 'date-fns';

// GET all staff for current user
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const staff = await Staff.find({ userId }).sort({ createdAt: -1 });

    // Get today's appointment counts for each staff
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const staffWithCounts = await Promise.all(
      staff.map(async (s) => {
        const appointmentCount = await Appointment.countDocuments({
          staffId: s._id,
          startTime: { $gte: todayStart, $lte: todayEnd },
          status: { $nin: ['cancelled', 'no_show'] },
        });

        return {
          id: s._id.toString(),
          name: s.name,
          serviceType: s.serviceType,
          dailyCapacity: s.dailyCapacity,
          status: s.status,
          todayAppointments: appointmentCount,
          createdAt: s.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: staffWithCounts,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// POST create new staff
export const POST = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    const body = await request.json();

    // Validate input
    const validatedFields = createStaffSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const staff = await Staff.create({
      ...validatedFields.data,
      userId,
    });

    // Log activity
    const { ActivityLog } = await import('@/models');
    await ActivityLog.create({
      userId,
      action: 'staff_created',
      details: `Created staff member "${staff.name}" (${staff.serviceType})`,
      metadata: { staffId: staff._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Staff member created successfully',
        data: {
          id: staff._id.toString(),
          name: staff.name,
          serviceType: staff.serviceType,
          dailyCapacity: staff.dailyCapacity,
          status: staff.status,
          todayAppointments: 0,
          createdAt: staff.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
