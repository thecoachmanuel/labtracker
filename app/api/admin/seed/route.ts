import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-seed-token') || req.nextUrl.searchParams.get('token') || ''
  const expected = process.env.ADMIN_SEED_TOKEN || ''
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({} as any))
  const email = body.email || 'admin@admin.com'
  const password = body.password || 'admin123'

  const { prisma } = await import('@/lib/prisma')
  const bcrypt = (await import('bcryptjs')).default

  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (existingAdmin) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email,
      password_hash,
      role: 'ADMIN'
    }
  })

  return NextResponse.json({ message: 'Admin created', email }, { status: 201 })
}
