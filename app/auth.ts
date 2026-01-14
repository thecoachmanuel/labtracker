import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { unit: true }
        })

        if (!user) {
          console.log('User not found:', credentials.email)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isPasswordValid) {
          console.log('Invalid password for user:', credentials.email)
          return null
        }

        console.log('User logged in successfully:', credentials.email)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          unit_id: user.unit_id || undefined,
          unit_name: user.unit?.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.unit_id = (user as any).unit_id
        token.unit_name = (user as any).unit_name
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.unit_id = token.unit_id as string | undefined
        session.user.unit_name = token.unit_name as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    }
  }
}
