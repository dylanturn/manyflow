import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/server/auth/service'
import { withMiddleware } from '@/lib/server/auth/middleware'

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { user, token } = await AuthService.createUser(body)
    
    return NextResponse.json({ user, token })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 400 })
  }
}

// Apply rate limiting to prevent registration abuse
export const POST = withMiddleware(handler, { rateLimit: true })
