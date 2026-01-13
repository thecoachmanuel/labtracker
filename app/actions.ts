'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { hash } from 'bcryptjs'

// --- Receptionist Actions ---

export async function getReceptionistSamples() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  return prisma.sample.findMany({
    where: {
      unit_id: session.user.unit_id
    },
    include: {
      tests: {
        include: {
          test: true
        }
      },
      status_logs: true,
      created_by: true,
      processed_by: true,
      unit: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })
}

export async function createSample(data: any) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.unit_id) throw new Error('Unauthorized: No unit assigned')

  // Validation
  if (!data.patient_name || !data.tests || data.tests.length === 0) {
      throw new Error('Invalid data')
  }

  const sample = await prisma.sample.create({
    data: {
      patient_name: data.patient_name,
      age: data.age,
      gender: data.gender,
      clinical_info: data.clinical_info,
      specimen_type: data.specimen_type,
      source: data.source,
      ward_id: data.ward_id,
      unit_id: session.user.unit_id,
      created_by_id: session.user.id,
      accession_number: `ACC-${Date.now()}`, // Simple generation
      lab_number: data.lab_number,
      status: 'RECEIVED',
      tests: {
        create: data.tests.map((testId: string) => ({
          test_id: testId,
          status: 'PENDING'
        }))
      },
      status_logs: {
          create: {
              to_status: 'RECEIVED',
              user_id: session.user.id,
              notes: 'Sample registered'
          }
      }
    }
  })

  revalidatePath('/dashboard/reception')
  return sample
}

// --- Scientist Actions ---

export async function getScientistSamples(unitId: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    return prisma.sample.findMany({
        where: { unit_id: unitId },
        include: {
            tests: { include: { test: true } },
            status_logs: true
        },
        orderBy: { created_at: 'desc' }
    })
}

export async function getScientistLiveStats(unitId: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [newArrivals, ongoing, completed] = await Promise.all([
        prisma.sample.findMany({
            where: {
                unit_id: unitId,
                status: 'RECEIVED'
            },
            include: { tests: { include: { test: { include: { bench: true } } } } },
            orderBy: { created_at: 'desc' }
        }),
        prisma.sample.findMany({
            where: {
                unit_id: unitId,
                status: { in: ['IN_PROCESSING', 'AWAITING_REVIEW'] }
            },
            include: { tests: { include: { test: { include: { bench: true } } } } },
            orderBy: { updated_at: 'desc' }
        }),
        prisma.sample.findMany({
            where: {
                unit_id: unitId,
                status: 'COMPLETED',
                updated_at: { gte: twentyFourHoursAgo }
            },
            include: { tests: { include: { test: { include: { bench: true } } } } },
            orderBy: { updated_at: 'desc' }
        })
    ])

    return { newArrivals, ongoing, completed }
}

export async function claimTest(sampleId: string, testId: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  const sampleTest = await prisma.sampleTest.findUnique({
    where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } }
  })

  if (!sampleTest) throw new Error('Test not found')
  if (sampleTest.assigned_to_id) throw new Error('Test already claimed')

  await prisma.sampleTest.update({
    where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } },
    data: { assigned_to_id: session.user.id }
  })
  
  // Also update sample status if it's the first test claimed
  const sample = await prisma.sample.findUnique({ where: { id: sampleId } })
  if (sample && sample.status === 'RECEIVED') {
      await prisma.sample.update({
          where: { id: sampleId },
          data: { status: 'IN_PROCESSING' }
      })
      await prisma.sampleStatusLog.create({
          data: {
              sample_id: sampleId,
              from_status: 'RECEIVED',
              to_status: 'IN_PROCESSING',
              user_id: session.user.id,
              notes: 'First test claimed'
          }
      })
  }

  revalidatePath('/dashboard/scientist')
}

// Alias for claimTest
export const claimSampleTest = claimTest

export async function unclaimSampleTest(sampleId: string, testId: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    const sampleTest = await prisma.sampleTest.findUnique({
        where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } }
    })

    if (!sampleTest) throw new Error('Test not found')
    if (sampleTest.assigned_to_id !== session.user.id) throw new Error('Not assigned to you')

    await prisma.sampleTest.update({
        where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } },
        data: { assigned_to_id: null }
    })
    revalidatePath('/dashboard/scientist')
}

export async function updateSampleStatus(sampleId: string, status: string, notes?: string, labNumber?: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    const current = await prisma.sample.findUnique({ where: { id: sampleId } })
    
    const data: any = { status }
    if (labNumber) {
        data.lab_number = labNumber
    }
    
    await prisma.sample.update({
        where: { id: sampleId },
        data
    })
    
    await prisma.sampleStatusLog.create({
        data: {
            sample_id: sampleId,
            from_status: current?.status,
            to_status: status,
            user_id: session.user.id,
            notes: notes
        }
    })
    revalidatePath('/dashboard/scientist')
}

export async function updateTestStatus(sampleId: string, testId: string, status: string, result?: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    await prisma.sampleTest.update({
        where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } },
        data: { status, result }
    })
    
    // Check if all tests completed to update sample status
    revalidatePath('/dashboard/scientist')
}

export async function updateTestResult(sampleId: string, testId: string, result: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    await prisma.sampleTest.update({
        where: { sample_id_test_id: { sample_id: sampleId, test_id: testId } },
        data: { result, status: 'COMPLETED', completed_at: new Date() }
    })
    
    // Check if all tests are completed
    const sample = await prisma.sample.findUnique({
        where: { id: sampleId },
        include: { tests: true }
    })
    
    if (sample && sample.tests.every(t => t.status === 'COMPLETED')) {
        await prisma.sample.update({
            where: { id: sampleId },
            data: { status: 'COMPLETED', processed_by_id: session.user.id }
        })
        await prisma.sampleStatusLog.create({
            data: {
                sample_id: sampleId,
                from_status: sample.status,
                to_status: 'COMPLETED',
                user_id: session.user.id,
                notes: 'All tests completed'
            }
        })
    }
    
    revalidatePath('/dashboard/scientist')
}

// --- Benches ---

export async function getUnitBenches(unitId: string) {
    return prisma.bench.findMany({ where: { unit_id: unitId } })
}

export async function getUserBenches(userId: string) {
    const userBenches = await prisma.userBench.findMany({
        where: { user_id: userId },
        include: { bench: true }
    })
    return userBenches.map(ub => ub.bench)
}

export async function updateUserBenches(userId: string, benchIds: string[]) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== userId) throw new Error('Unauthorized')
    
    // Transaction: delete old, create new
    await prisma.$transaction([
        prisma.userBench.deleteMany({ where: { user_id: userId } }),
        prisma.userBench.createMany({
            data: benchIds.map(id => ({ user_id: userId, bench_id: id }))
        })
    ])
    revalidatePath('/dashboard/scientist')
}

// --- Admin / Settings Stubs ---

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    if (!settings) {
      return {
        logoUrl: null,
        logoTitle: "LabTracker",
        heroTitle: "Precision Sample Tracking For Modern Labs",
        heroSubtitle: "Streamline your laboratory workflow with our secure, real-time sample management system.",
        heroButtonText: "Start Tracking Now"
      }
    }
    return settings
  } catch (e) {
    return {
      logoUrl: null,
      logoTitle: "LabTracker",
      heroTitle: "Precision Sample Tracking For Modern Labs",
      heroSubtitle: "Streamline your laboratory workflow with our secure, real-time sample management system.",
      heroButtonText: "Start Tracking Now"
    }
  }
}

export async function updateSiteSettings(data: any) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')

    const first = await prisma.siteSettings.findFirst()
    if (first) {
        await prisma.siteSettings.update({
            where: { id: first.id },
            data
        })
    } else {
        await prisma.siteSettings.create({ data })
    }
    revalidatePath('/')
}

export async function uploadLogo(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    
    const file = formData.get('file') as File
    if (!file) throw new Error('No file')
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const path = join(process.cwd(), 'public/uploads', file.name)
    await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true })
    await writeFile(path, buffer)
    
    return `/uploads/${file.name}`
}

export async function getUnits() {
    return prisma.unit.findMany()
}

export async function createUnit(name: string, defaultTat: number = 1440) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    await prisma.unit.create({ data: { name, default_tat_minutes: defaultTat } })
    revalidatePath('/dashboard/admin')
}

export async function updateUnit(id: string, name: string, defaultTat?: number) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    
    const data: any = { name }
    if (defaultTat !== undefined) data.default_tat_minutes = defaultTat
    
    await prisma.unit.update({ where: { id }, data })
    revalidatePath('/dashboard/admin')
}

export async function deleteUnit(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    await prisma.unit.delete({ where: { id } })
    revalidatePath('/dashboard/admin')
}

export async function getTests(unitId?: string) {
    if (unitId) {
        return prisma.test.findMany({ where: { unit_id: unitId }, include: { bench: true } })
    }
    return prisma.test.findMany({ include: { bench: true } })
}

export async function createTest(data: any) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.test.create({ data })
    revalidatePath('/dashboard/admin')
}

export async function updateTest(id: string, data: any) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.test.update({ where: { id }, data })
    revalidatePath('/dashboard/admin')
}

export async function deleteTest(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.test.delete({ where: { id } })
    revalidatePath('/dashboard/admin')
}

export async function assignTestToBench(testId: string, benchId: string | null) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    
    await prisma.test.update({
        where: { id: testId },
        data: { bench_id: benchId }
    })
    revalidatePath('/dashboard/admin')
}

export async function createBench(name: string, unitId: string) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.bench.create({ data: { name, unit_id: unitId } })
    revalidatePath('/dashboard/admin')
}

export async function updateBench(id: string, name: string) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.bench.update({ where: { id }, data: { name } })
    revalidatePath('/dashboard/admin')
}

export async function deleteBench(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.bench.delete({ where: { id } })
    revalidatePath('/dashboard/admin')
}

export async function getWards() {
    return prisma.ward.findMany()
}

export async function createWard(name: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    await prisma.ward.create({ data: { name } })
    revalidatePath('/dashboard/admin')
}

export async function updateWard(id: string, name: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    await prisma.ward.update({ where: { id }, data: { name } })
    revalidatePath('/dashboard/admin')
}

export async function deleteWard(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') throw new Error('Unauthorized')
    await prisma.ward.delete({ where: { id } })
    revalidatePath('/dashboard/admin')
}

export async function getUsers() {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    
    if (session.user.role === 'UNIT_ADMIN') {
         const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
         return prisma.user.findMany({ where: { unit_id: currentUser?.unit_id }, include: { unit: true } })
    }
    return prisma.user.findMany({ include: { unit: true } })
}

export async function updateUser(id: string, data: any) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.user.update({ where: { id }, data })
    revalidatePath('/dashboard/admin')
}

export async function deleteUser(id: string) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    await prisma.user.delete({ where: { id } })
    revalidatePath('/dashboard/admin')
}

export async function getLiveSamples(
  query: string = '', 
  dateFilter: { 
    type: 'all' | 'date' | 'week' | 'month' | 'year', 
    value?: string 
  } = { type: 'all' },
  unitId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'UNIT_ADMIN', 'SUPERVISOR'].includes(session.user.role)) throw new Error('Unauthorized')

  const where: Prisma.SampleWhereInput = {}

  if (session.user.role === 'UNIT_ADMIN') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { unit_id: true }
    })
    
    if (user?.unit_id) {
      where.unit_id = user.unit_id
    }
  }
  
  if (session.user.role === 'ADMIN' && unitId && unitId !== 'ALL') {
    where.unit_id = unitId
  }

  if (query) {
    where.OR = [
      { patient_name: { contains: query } },
      { accession_number: { contains: query } },
      { lab_number: { contains: query } }
    ]
  }

  // Date filtering logic omitted for brevity in stub but can be added if needed
  
  return prisma.sample.findMany({
      where,
      include: {
          unit: true,
          tests: { include: { test: true } },
          status_logs: { orderBy: { timestamp: 'desc' } },
          created_by: true,
          processed_by: true
      },
      orderBy: { created_at: 'desc' }
  })
}

export async function searchSamples(query: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')
    
    if (!query || query.length < 2) return []
    
    return prisma.sample.findMany({
        where: {
            OR: [
                { patient_name: { contains: query } },
                { accession_number: { contains: query } },
                { lab_number: { contains: query } }
            ]
        },
        include: {
            tests: { include: { test: true } },
            unit: true,
            status_logs: true,
            created_by: true,
            processed_by: true
        },
        orderBy: { created_at: 'desc' },
        take: 20
    })
}

export async function getSLAStats(unitId?: string) {
    return { byUnit: [], byTest: [] }
}

export async function getSupervisorStats(unitId?: string) {
    return {
        totalSamples: 0,
        delayedSamples: 0,
        escalatedCount: 0,
        escalatedSamples: [],
        unitStats: [],
        chartData: []
    }
}

export async function getUnitSamples(unitId: string) {
    return prisma.sample.findMany({
        where: { unit_id: unitId },
        include: {
            tests: { include: { test: true } },
            status_logs: true,
            created_by: true,
            processed_by: true
        },
        orderBy: { created_at: 'desc' }
    })
}

export async function getRegistrationReport(params: { unitId: string, dateFilter: string, date: string }) {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    
    let startDate = new Date(0)
    let endDate = new Date()
    const referenceDate = new Date(params.date)

    if (params.dateFilter === 'day') {
        startDate = new Date(referenceDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(referenceDate)
        endDate.setHours(23, 59, 59, 999)
    } else if (params.dateFilter === 'week') {
        const day = referenceDate.getDay()
        startDate = new Date(referenceDate)
        startDate.setDate(referenceDate.getDate() - day)
        startDate.setHours(0,0,0,0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23,59,59,999)
    } else if (params.dateFilter === 'month') {
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
        endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
        endDate.setHours(23,59,59,999)
    }

    const where: any = {
        created_at: {
            gte: startDate,
            lte: endDate
        }
    }
    
    if (params.unitId && params.unitId !== 'all') {
        where.unit_id = params.unitId
    }

    if (session.user.role === 'UNIT_ADMIN') {
         const user = await prisma.user.findUnique({ where: { id: session.user.id } })
         if (user?.unit_id) where.unit_id = user.unit_id
    }
    
    return prisma.sample.findMany({
        where,
        include: { 
            created_by: true,
            unit: true,
            tests: { include: { test: true } }
        },
        orderBy: { created_at: 'desc' }
    })
}

export async function registerUser(data: any) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new Error('User already exists')
    
    const hashedPassword = await hash(data.password, 10)
    
    await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password_hash: hashedPassword,
            role: data.role || 'LAB_SCIENTIST',
            unit_id: data.unit_id
        }
    })
    revalidatePath('/dashboard/admin')
}

export const createUser = registerUser

export async function getAllBenches() {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    return prisma.bench.findMany({ include: { unit: true } })
}

export async function getTestsWithUnits() {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) throw new Error('Unauthorized')
    return prisma.test.findMany({ include: { unit: true, bench: true } })
}

export async function getSamplePublicStatus(accession: string) {
    if (!accession) return { found: false }
    
    const sample = await prisma.sample.findFirst({
        where: { accession_number: accession },
        include: {
            unit: true,
            tests: { include: { test: true } }
        }
    })
    
    if (!sample) return { found: false }
    
    const isResultsReady = sample.status === 'COMPLETED'
    
    return {
        found: true,
        status: sample.status,
        unitName: sample.unit?.name,
        isResultsReady,
        tests: sample.tests.map(t => ({
            name: t.test.name,
            hasResult: t.status === 'COMPLETED'
        }))
    }
}
