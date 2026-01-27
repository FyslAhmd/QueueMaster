import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationError, formatErrorResponse } from '@/lib/errors';

// Generic type for route handler context - individual routes can be more specific
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

// Wrapper to protect API routes
export function withAuth<T = RouteContext>(
  handler: (request: NextRequest, context: T, userId: string) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (!session?.user?.id) {
        throw new AuthenticationError('You must be logged in to access this resource');
      }

      return handler(request, context, session.user.id);
    } catch (error) {
      const errorResponse = formatErrorResponse(error);
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
    }
  };
}

// Get current user ID from session (for use in server components/actions)
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.id;
}
