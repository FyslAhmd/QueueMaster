import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ActivityLog } from '@/models';
import { withAuth } from '@/lib/auth-utils';
import { formatErrorResponse } from '@/lib/errors';
import { format } from 'date-fns';

// Helper to parse action into entity and action type
function parseAction(action: string): { entityType: string; actionType: string } {
  const parts = action.split('_');
  if (parts.length >= 2) {
    const actionType = parts[parts.length - 1]; // last part is the action
    const entityType = parts.slice(0, -1).join('_'); // everything before is the entity
    return { entityType, actionType };
  }
  return { entityType: 'unknown', actionType: action };
}

// GET activity logs
export const GET = withAuth(async (request: NextRequest, context, userId: string) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const total = await ActivityLog.countDocuments({ userId });
    const logs = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const logsDTO = logs.map((log) => {
      const { entityType, actionType } = parseAction(log.action);
      return {
        id: log._id.toString(),
        action: log.action,           // Full action: 'appointment_created'
        actionType,                    // Just the action: 'created'
        entityType,                    // The entity: 'appointment'
        description: log.details,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
        time: format(log.createdAt, 'h:mm a'),
        metadata: log.metadata || {},
      };
    });

    return NextResponse.json({
      success: true,
      data: logsDTO,
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
