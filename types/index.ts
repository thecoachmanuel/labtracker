import { Sample, SampleTest, Test, Unit, SampleStatusLog, User, Ward, Bench } from '@prisma/client'

export type TestWithUnit = Test & { unit: Unit }
export type BenchWithUnit = Bench & { unit: Unit }
export type UserWithUnit = User & { unit: Unit | null }

export type SampleWithDetails = Sample & {
  tests: (SampleTest & { 
    test: Test 
    assigned_to?: { id: string, name: string } | null 
  })[]
  unit: Unit
  status_logs: SampleStatusLog[]
  processed_by: { name: string } | null
  created_by: { name: string } | null
}
