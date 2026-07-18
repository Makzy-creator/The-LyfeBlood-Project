import { NextRequest, NextResponse } from 'next/server'
import { buildClearRememberSessionCookie } from '@/lib/session-cookie'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Logged out' },
    {
      headers: {
        'Set-Cookie': buildClearRememberSessionCookie(request as unknown as Request),
      },
    }
  )
}
