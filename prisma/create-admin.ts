import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return
  const password_hash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name: 'Administrator',
      email,
      password_hash,
      role: 'ADMIN'
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    await prisma.$disconnect()
    process.exit(1)
  })
