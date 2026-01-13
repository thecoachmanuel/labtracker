import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-seed-token') || req.nextUrl.searchParams.get('token') || ''
  const expected = process.env.ADMIN_SEED_TOKEN || ''
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result: Record<string, any> = {}
  try {
    const { prisma } = await import('@/lib/prisma')

    try {
      await prisma.$queryRaw`SELECT 1`
      result.dbConnected = true
    } catch {
      result.dbConnected = false
    }

    try {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      result.adminExists = !!admin
    } catch {
      result.adminExists = false
    }
  } catch {
    result.dbConnected = false
    result.adminExists = false
  }

  result.isPostgresProtocol = (process.env.DATABASE_URL || '').toLowerCase().startsWith('postgres')
  result.nextauthUrlSet = !!process.env.NEXTAUTH_URL
  result.nextauthSecretSet = !!process.env.NEXTAUTH_SECRET

  return NextResponse.json(result)
}
