import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const { prisma } = await import('@/lib/prisma')
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) return NextResponse.json({ exists: false })
  return NextResponse.json({ exists: true, email: admin.email })
}
