import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/server/auth/service'
import { withMiddleware } from '@/lib/server/auth/middleware'

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 })
  }

  try {
    const { username, password } = await req.json()
    
    if (!username || !password) {
      return new NextResponse('Username and password are required', { status: 400 })
    }

    const { user, token } = await AuthService.login(username, password)
    
    return NextResponse.json({ user, token })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 401 })
  }
}

// Apply rate limiting to prevent brute force attacks
export const POST = withMiddleware(handler, { rateLimit: true })
