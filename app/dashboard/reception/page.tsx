import { getUnits, getTests, getWards } from '@/app/actions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import ReceptionForm from '@/components/ReceptionForm'
import SampleSearch from '@/components/SampleSearch'
import ReceptionistSampleList from '@/components/ReceptionistSampleList'

export default async function ReceptionDashboard() {
  const session = await getServerSession(authOptions)
  const [units, tests, wards] = await Promise.all([
    getUnits(),
    getTests(),
    getWards()
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sample Registration</h1>
      <ReceptionForm 
        units={units} 
        tests={tests} 
        wards={wards} 
        currentUserUnitId={session?.user.unit_id}
      />
      
      <div className="mt-8">
        <ReceptionistSampleList />
      </div>

      <div className="mt-8">
        <SampleSearch />
      </div>
    </div>
  )
}
