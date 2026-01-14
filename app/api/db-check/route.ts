
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, role: true, id: true }
    })
    
    return NextResponse.json({ 
      status: 'ok', 
      userCount, 
      adminExists: !!admin,
      adminEmail: admin?.email 
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown DB error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
