import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    unit_id?: string
    unit_name?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      unit_id?: string
      unit_name?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    unit_id?: string
    unit_name?: string
  }
}
