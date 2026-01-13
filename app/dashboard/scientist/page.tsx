import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { getUnitSamples, getUnitBenches, getUserBenches } from '@/app/actions'
import ScientistDashboard from '@/components/ScientistDashboard'
import SampleSearch from '@/components/SampleSearch'

export default async function ScientistPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user.unit_id) {
    return <div>No unit assigned</div>
  }

  const [samples, unitBenches, userBenches] = await Promise.all([
    getUnitSamples(session.user.unit_id),
    getUnitBenches(session.user.unit_id),
    getUserBenches(session.user.id)
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {session.user.unit_name} Dashboard
        </h1>
      </div>
      
      <SampleSearch />
      
      <ScientistDashboard 
        initialSamples={samples} 
        unitBenches={unitBenches}
        initialUserBenches={userBenches}
        userId={session.user.id}
        unitId={session.user.unit_id}
      />
    </div>
  )
}
