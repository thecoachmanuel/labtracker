import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { getUnits, getWards, getTestsWithUnits, getUsers, getAllBenches } from '@/app/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminTabs from '@/components/admin/AdminTabs'
import { BarChart3, Settings } from 'lucide-react'
import type { Bench } from '@prisma/client'
import { Suspense } from 'react'

export default async function AdminPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const session = await getServerSession(authOptions)
  
  if (!session || !['ADMIN', 'UNIT_ADMIN'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  if (!searchParams.tab) {
    redirect('/dashboard/admin?tab=live-samples')
  }

  let units, wards, tests, users, benches;

  try {
    [units, wards, tests, users, benches] = await Promise.all([
      getUnits(),
      getWards(),
      getTestsWithUnits(),
      getUsers(),
      getAllBenches()
    ])
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      redirect('/api/auth/signout')
    }
    throw error
  }

  // Filter benches if Unit Admin (though server action should handle permissions, passing all benches might be overkill if not filtered. 
  // But getAllBenches is global. For Unit Admin, we should ideally filter.
  // Actually, let's filter here for display.
  const displayedBenches = session.user.role === 'UNIT_ADMIN' 
    ? benches.filter((b: Bench) => b.unit_id === session.user.unit_id)
    : benches

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {session.user.role === 'UNIT_ADMIN' ? `${session.user.unit_name || 'Unit'} Administration` : 'Lasuth Laboratory Tracker'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {session.user.role === 'UNIT_ADMIN' 
              ? 'Manage users, benches and test configurations for your unit.' 
              : 'Manage users, laboratory units, wards, and test configurations including Turnaround Times (TAT).'}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
          {session.user.role === 'ADMIN' && (
            <Link
              href="/dashboard/admin/settings"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Settings className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Site Settings
            </Link>
          )}
          <Link
            href="/dashboard/supervisor"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <BarChart3 className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            View Analytics
          </Link>
        </div>
      </div>
      
      <Suspense fallback={<div className="p-8 text-center">Loading admin dashboard...</div>}>
        <AdminTabs 
          units={units} 
          wards={wards} 
          tests={tests} 
          users={users} 
          benches={displayedBenches}
          currentUserRole={session.user.role}
          currentUserUnitId={session.user.unit_id}
        />
      </Suspense>
    </div>
  )
}
