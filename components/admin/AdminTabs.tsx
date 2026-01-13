'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Unit, Ward, Test, User, Bench } from '@prisma/client'
import { TestWithUnit, UserWithUnit, BenchWithUnit } from '@/types'
import UnitManager from './UnitManager'
import WardManager from './WardManager'
import TestManager from './TestManager'
import UserManager from './UserManager'
import BenchManager from './BenchManager'
import RegistrationReport from './RegistrationReport'
import LiveSampleList from '../LiveSampleList'
import { LayoutGrid, Bed, FlaskConical, Users, Microscope, Activity, FileText } from 'lucide-react'

interface AdminTabsProps {
  units: Unit[]
  wards: Ward[]
  tests: TestWithUnit[]
  users: UserWithUnit[]
  benches: BenchWithUnit[]
  currentUserRole: string
  currentUserUnitId?: string
}

export default function AdminTabs({ 
  units, 
  wards, 
  tests,
  users,
  benches,
  currentUserRole,
  currentUserUnitId
}: AdminTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const validTabs = ['users','units','wards','tests','benches','live-samples','reports'] as const
  const urlTab = searchParams.get('tab')
  const initialTab: typeof validTabs[number] = (urlTab && (validTabs as readonly string[]).includes(urlTab))
    ? (urlTab as typeof validTabs[number])
    : 'live-samples'
  const [activeTab, setActiveTab] = useState<'users' | 'units' | 'wards' | 'tests' | 'benches' | 'live-samples' | 'reports'>(initialTab)
  const isUnitAdmin = currentUserRole === 'UNIT_ADMIN'

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('admin_active_tab', activeTab)
    const current = searchParams.get('tab')
    if (current === activeTab) return
    const next = new URLSearchParams(searchParams.toString())
    next.set('tab', activeTab)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }, [activeTab, searchParams, pathname, router])

  // Sync URL to activeTab is handled in the effect above and via button clicks.

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-nowrap overflow-x-auto scrollbar-hidden snap-x snap-mandatory w-full max-w-full" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('live-samples')}
            className={`${
              activeTab === 'live-samples'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Live Samples
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </button>
          
          {!isUnitAdmin && (
            <button
              onClick={() => setActiveTab('units')}
              className={`${
                activeTab === 'units'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Units
            </button>
          )}

          {!isUnitAdmin && (
            <button
              onClick={() => setActiveTab('wards')}
              className={`${
                activeTab === 'wards'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <Bed className="w-4 h-4 mr-2" />
              Wards
            </button>
          )}

          <button
            onClick={() => setActiveTab('benches')}
            className={`${
              activeTab === 'benches'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <Microscope className="w-4 h-4 mr-2" />
            Benches
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`${
              activeTab === 'tests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Tests & TAT
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } shrink-0 cursor-pointer whitespace-nowrap snap-start py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'live-samples' && <LiveSampleList />}
        {activeTab === 'users' && <UserManager users={users} units={units} currentUserRole={currentUserRole} currentUserUnitId={currentUserUnitId} />}
        {activeTab === 'units' && !isUnitAdmin && <UnitManager units={units} />}
        {activeTab === 'wards' && !isUnitAdmin && <WardManager wards={wards} />}
        {activeTab === 'benches' && <BenchManager benches={benches} units={units} currentUserRole={currentUserRole} currentUserUnitId={currentUserUnitId} />}
        {activeTab === 'tests' && <TestManager tests={tests} units={units} benches={benches} currentUserRole={currentUserRole} currentUserUnitId={currentUserUnitId} />}
        {activeTab === 'reports' && <RegistrationReport units={units} userRole={currentUserRole} />}
      </div>
    </div>
  )
}
