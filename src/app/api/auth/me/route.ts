import { NextResponse } from 'next/server'
import { withMiddleware, AuthenticatedRequest } from '@/lib/server/auth/middleware'

async function handler(req: AuthenticatedRequest) {
  if (req.method !== 'GET') {
    return new NextResponse('Method not allowed', { status: 405 })
  }

  // User is already authenticated by middleware
  return NextResponse.json({ user: req.user })
}

// Require authentication to access this endpoint
export const GET = withMiddleware(handler)
