import NextAuth from 'next-auth'
import { NextRequest } from 'next/server'
import { authOptions } from '@/app/auth'

const authHandler = NextAuth(authOptions)

type RouteCtx = { params: Promise<{ nextauth: string[] }> }

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return authHandler(req, ctx)
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  return authHandler(req, ctx)
}
