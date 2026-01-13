'use client'

import { useState, useEffect, useRef } from 'react'
import type { Sample, SampleTest, Test, SampleStatusLog, Bench } from '@prisma/client'
import { updateUserBenches, getScientistLiveStats } from '@/app/actions'
import SampleCard from './SampleCard'
import { toast } from 'sonner'
import { Filter, Check, Activity, Clock, CheckCircle } from 'lucide-react'

type SampleWithTests = Sample & {
  tests: (SampleTest & { test: Test })[]
  status_logs: SampleStatusLog[]
}

export default function ScientistDashboard({
  initialSamples,
  unitBenches,
  initialUserBenches,
  userId,
  unitId,
}: {
  initialSamples: SampleWithTests[]
  unitBenches: Bench[]
  initialUserBenches: Bench[]
  userId: string
  unitId: string
}) {
  const [filter, setFilter] = useState('ALL')
  const [selectedBenchIds, setSelectedBenchIds] = useState<string[]>(initialUserBenches.map(b => b.id))
  const [isBenchFilterOpen, setIsBenchFilterOpen] = useState(false)
  
  // Real-time stats state
  const [liveStats, setLiveStats] = useState<{
    newArrivals: any[],
    ongoing: any[],
    completed: any[]
  } | null>(null)
  
  const lastArrivalsRef = useRef<string[]>([])

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const stats = await getScientistLiveStats(unitId)
            setLiveStats(stats)
            
            // Check for new arrivals
            const currentIds = stats.newArrivals.map((s: any) => s.id)
            if (lastArrivalsRef.current.length > 0) {
                const brandNew = stats.newArrivals.filter((s: any) => !lastArrivalsRef.current.includes(s.id))
                brandNew.forEach((s: any) => {
                     const benchNames = Array.from(new Set(s.tests.map((t: any) => t.test.test.bench?.name || 'Unassigned'))).join(', ')
                     toast.info(`New Arrival at ${benchNames}`, {
                         description: `${s.patient_name} - ${s.tests.length} tests`
                     })
                })
            }
            lastArrivalsRef.current = currentIds
        } catch (error) {
            console.error('Failed to fetch live stats', error)
        }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 15000) // Poll every 15 seconds
    return () => clearInterval(interval)
  }, [unitId])


  const handleBenchToggle = async (benchId: string) => {
    const newSelection = selectedBenchIds.includes(benchId)
      ? selectedBenchIds.filter(id => id !== benchId)
      : [...selectedBenchIds, benchId]
    
    setSelectedBenchIds(newSelection)
    try {
      await updateUserBenches(userId, newSelection)
    } catch {
      toast.error('Failed to save bench preference')
    }
  }

  const filteredSamples = initialSamples.filter(sample => {
    // My Tasks filter
    if (filter === 'MY_TASKS') {
      // Show samples where I have at least one claimed test
      // AND status is not completed (unless we want to see history?)
      // Usually "Tasks" implies active work.
      if (sample.status === 'COMPLETED') return false
      return sample.tests.some((t: SampleTest & { test: Test }) => t.assigned_to_id === userId)
    }

    // Status filter
    if (filter === 'ALL') {
      if (sample.status === 'COMPLETED') return false
    } else {
      if (sample.status !== filter) return false
    }

    // Bench filter
    if (selectedBenchIds.length === 0) return true
    
    // Show sample if ANY of its tests belong to ANY of the selected benches
    return sample.tests.some((t: SampleTest & { test: Test }) => t.test.bench_id && selectedBenchIds.includes(t.test.bench_id))
  })

  return (
    <div className="space-y-6">
      {/* Live Stats Banner */}
      {liveStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">New Arrivals</p>
                <p className="text-2xl font-bold text-blue-700">{liveStats.newArrivals.length}</p>
                <div className="text-xs text-blue-600 mt-1 max-h-12 overflow-y-auto">
                   {liveStats.newArrivals.length > 0 ? (
                       liveStats.newArrivals.slice(0, 3).map((s: any) => (
                           <div key={s.id} className="truncate">
                               {s.patient_name} <span className="text-blue-400">•</span> {Array.from(new Set(s.tests.map((t: any) => t.test.test.bench?.name))).join(', ')}
                           </div>
                       ))
                   ) : 'No new arrivals'}
                   {liveStats.newArrivals.length > 3 && <div className="italic">+ {liveStats.newArrivals.length - 3} more</div>}
                </div>
              </div>
           </div>
           
           <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-center space-x-4">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Ongoing</p>
                <p className="text-2xl font-bold text-amber-700">{liveStats.ongoing.length}</p>
                <div className="text-xs text-amber-600 mt-1">
                    {liveStats.ongoing.length > 0 ? 'Active Processing' : 'No active tests'}
                </div>
              </div>
           </div>

           <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Completed (24h)</p>
                <p className="text-2xl font-bold text-green-700">{liveStats.completed.length}</p>
                 <div className="text-xs text-green-600 mt-1">
                    Recent completions
                </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex flex-nowrap items-center space-x-2 overflow-x-auto scrollbar-hidden snap-x snap-mandatory pb-2 sm:pb-0 w-full max-w-full">
          <button
            onClick={() => setFilter('MY_TASKS')}
            className={`shrink-0 cursor-pointer px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start ${
              filter === 'MY_TASKS'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Tasks
          </button>
          {['ALL', 'RECEIVED', 'IN_PROCESSING', 'AWAITING_REVIEW', 'DELAYED', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`shrink-0 cursor-pointer px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Active Queue' : status.replace('_', ' ')}
            </button>
          ))}
          </div>
          <div className="sm:hidden pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsBenchFilterOpen(!isBenchFilterOpen)}
            className={`cursor-pointer inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              selectedBenchIds.length > 0
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Benches {selectedBenchIds.length > 0 && `(${selectedBenchIds.length})`}
          </button>

          {isBenchFilterOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Filter by Bench
                </div>
                {unitBenches.map(bench => (
                  <button
                    key={bench.id}
                    onClick={() => handleBenchToggle(bench.id)}
                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    role="menuitem"
                  >
                    <span>{bench.name}</span>
                    {selectedBenchIds.includes(bench.id) && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                ))}
                {unitBenches.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500 italic">
                    No benches defined
                  </div>
                )}
                {selectedBenchIds.length > 0 && (
                  <button
                    onClick={() => {
                        setSelectedBenchIds([])
                        updateUserBenches(userId, [])
                    }}
                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSamples.length > 0 ? (
          filteredSamples.map(sample => (
            <SampleCard 
              key={sample.id} 
              sample={sample} 
              canEditResults={true} 
              userRole="LAB_SCIENTIST" 
              currentUserId={userId}
              showOnlyMyTests={filter === 'MY_TASKS'}
              selectedBenchIds={selectedBenchIds}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No samples found matching criteria
          </div>
        )}
      </div>
    </div>
  )
}
