
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const password = 'admin123'
    const password_hash = await bcrypt.hash(password, 10)
    
    const updated = await prisma.user.updateMany({
      where: { email: 'admin@admin.com' },
      data: { password_hash }
    })
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Admin password reset to admin123',
      count: updated.count
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
