import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.sampleTest.deleteMany()
  await prisma.sampleStatusLog.deleteMany()
  await prisma.sample.deleteMany()
  await prisma.test.deleteMany()
  await prisma.user.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.ward.deleteMany()

  // Units
  const haematology = await prisma.unit.create({
    data: { name: 'Haematology', default_tat_minutes: 60 }
  })
  const chemistry = await prisma.unit.create({
    data: { name: 'Chemical Pathology', default_tat_minutes: 120 }
  })
  await prisma.unit.create({
    data: { name: 'Microbiology', default_tat_minutes: 1440 } // 24 hours
  })

  // Wards
  await prisma.ward.createMany({
    data: [
      { name: 'Emergency' },
      { name: 'OPD' },
      { name: 'Male Ward' },
      { name: 'Female Ward' },
    ]
  })

  // Tests
  await prisma.test.create({
    data: { name: 'Full Blood Count (FBC)', expected_tat_minutes: 60, unit_id: haematology.id }
  })
  await prisma.test.create({
    data: { name: 'Malaria Parasite', expected_tat_minutes: 45, unit_id: haematology.id }
  })
  await prisma.test.create({
    data: { name: 'Electrolytes, Urea & Creatinine', expected_tat_minutes: 120, unit_id: chemistry.id }
  })
  await prisma.test.create({
    data: { name: 'Liver Function Test', expected_tat_minutes: 120, unit_id: chemistry.id }
  })

  // Users
  const passwordHash = await bcrypt.hash('password', 10)

  await prisma.user.create({
    data: {
      name: 'Receptionist',
      email: 'reception@lab.com',
      password_hash: passwordHash,
      role: 'RECEPTION'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Haematology Scientist',
      email: 'scientist@lab.com',
      password_hash: passwordHash,
      role: 'LAB_SCIENTIST',
      unit_id: haematology.id
    }
  })
  
  await prisma.user.create({
    data: {
      name: 'Reviewer Doctor',
      email: 'reviewer@lab.com',
      password_hash: passwordHash,
      role: 'REVIEWER'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Lab Supervisor',
      email: 'supervisor@lab.com',
      password_hash: passwordHash,
      role: 'SUPERVISOR'
    }
  })

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@lab.com',
      password_hash: passwordHash,
      role: 'ADMIN'
    }
  })

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
