import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Service, ActivityLog } from '@/models';
import { createServiceSchema } from '@/lib/validations/service';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError } from '@/lib/errors';

// GET all services for current user
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const query: Record<string, unknown> = { userId };
    if (activeOnly) {
      query.status = 'active';
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    const servicesDTO = services.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      description: s.description,
      duration: s.duration,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: servicesDTO,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// POST create new service
export const POST = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    const body = await request.json();

    // Validate input
    const validatedFields = createServiceSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const service = await Service.create({
      ...validatedFields.data,
      status: validatedFields.data.status || 'active',
      userId,
    });

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'service_created',
      details: `Created service "${service.name}" (${service.duration} min)`,
      metadata: { serviceId: service._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        data: {
          id: service._id.toString(),
          name: service.name,
          description: service.description,
          duration: service.duration,
          status: service.status,
          createdAt: service.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
