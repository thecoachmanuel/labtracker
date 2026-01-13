import NextAuth from 'next-auth'
import { authOptions } from '@/app/auth'

const authHandler = NextAuth(authOptions)

export async function GET(req: Request) {
  return authHandler(req)
}

export async function POST(req: Request) {
  return authHandler(req)
}
