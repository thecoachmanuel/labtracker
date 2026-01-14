
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, role: true, id: true }
    })
    
    if (!admin) {
      return NextResponse.json({ status: 'error', message: 'No admin found in DB' }, { status: 404 })
    }

    return NextResponse.json({ status: 'ok', admin })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown DB error' }, { status: 500 })
  }
}
