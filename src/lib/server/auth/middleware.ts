import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './service'
import config from '../config'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    username: string
    role: 'user' | 'admin'
    email?: string
  }
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireAdmin?: boolean } = {}
) {
  return async (req: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized', { status: 401 })
      }

      const token = authHeader.split(' ')[1]
      const user = await AuthService.validateToken(token)

      // Check admin requirement
      if (options.requireAdmin && user.role !== 'admin') {
        return new NextResponse('Forbidden', { status: 403 })
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (error) {
      console.error('Auth error:', error)
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
}

// Rate limiting middleware
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = config.server.rateLimit.max
const RATE_WINDOW = config.server.rateLimit.windowMs

export async function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    let clientLimit = rateLimit.get(ip)
    
    // Reset rate limit if window has passed
    if (!clientLimit || now > clientLimit.resetTime) {
      clientLimit = { count: 0, resetTime: now + RATE_WINDOW }
    }

    // Check rate limit
    if (clientLimit.count >= RATE_LIMIT) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    // Update rate limit
    clientLimit.count++
    rateLimit.set(ip, clientLimit)

    return handler(req)
  }
}

// Combine multiple middleware
export function withMiddleware(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requireAdmin?: boolean; rateLimit?: boolean } = {}
) {
  let wrappedHandler = handler

  if (options.rateLimit) {
    wrappedHandler = withRateLimit(wrappedHandler as any) as any
  }

  return withAuth(wrappedHandler, { requireAdmin: options.requireAdmin })
}
