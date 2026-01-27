import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Service, ActivityLog } from '@/models';
import { updateServiceSchema } from '@/lib/validations/service';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse, ValidationError, NotFoundError, AuthorizationError } from '@/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

// GET single service by ID
export const GET = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;

    await dbConnect();

    const service = await Service.findById(id);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (service.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to view this service');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        duration: service.duration,
        status: service.status,
        createdAt: service.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// PUT update service
export const PUT = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validatedFields = updateServiceSchema.safeParse(body);

    if (!validatedFields.success) {
      const errors: Record<string, string> = {};
      validatedFields.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      throw new ValidationError('Validation failed', errors);
    }

    await dbConnect();

    const service = await Service.findById(id);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (service.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to update this service');
    }

    // Update service
    Object.assign(service, validatedFields.data);
    await service.save();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'service_updated',
      details: `Updated service "${service.name}"`,
      metadata: { serviceId: service._id, changes: validatedFields.data },
    });

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: {
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        duration: service.duration,
        status: service.status,
        createdAt: service.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});

// DELETE service
export const DELETE = withAuth(async (request: NextRequest, context: RouteContext, userId: string) => {
  try {
    const { id } = await context.params;

    await dbConnect();

    const service = await Service.findById(id);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (service.userId.toString() !== userId) {
      throw new AuthorizationError('You do not have permission to delete this service');
    }

    const serviceName = service.name;
    await service.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'service_deleted',
      details: `Deleted service "${serviceName}"`,
      metadata: { serviceId: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
});
