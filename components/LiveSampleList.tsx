'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLiveSamples } from '@/app/actions'
import { Sample, SampleTest, Test, SampleStatusLog } from '@prisma/client'
import { SampleWithDetails } from '@/types'
import { RefreshCw, Search, Calendar, Loader2, X, Filter, Bell, AlertTriangle } from 'lucide-react'
import { addMinutes, isPast } from 'date-fns'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import SampleCard from './SampleCard'

export default function LiveSampleList() {
  const [samples, setSamples] = useState<SampleWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [dateFilterType, setDateFilterType] = useState<'all' | 'date' | 'week' | 'month' | 'year'>('all')
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0])
  const [selectedSample, setSelectedSample] = useState<SampleWithDetails | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ALL')
  const [showIssuesOnly, setShowIssuesOnly] = useState(false)
  const [prevAlertCount, setPrevAlertCount] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const getProcessingStart = (s: SampleWithDetails) => {
    const log = s.status_logs?.find((l: SampleStatusLog) => l.to_status === 'IN_PROCESSING')
    return log ? new Date(log.timestamp) : null
  }

  const getTatMinutes = (s: SampleWithDetails) => {
    const minutes = s.tests.map((t: SampleTest & { test: Test }) => t.test.expected_tat_minutes || 0)
    return minutes.length ? Math.max(...minutes) : 0
  }

  const isOverdueTat = (s: SampleWithDetails) => {
    const start = getProcessingStart(s)
    const tat = getTatMinutes(s)
    if (!start || !tat) return false
    if (s.status === 'COMPLETED') return false
    return isPast(addMinutes(start, tat))
  }

  const fetchSamples = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setRefreshing(true)
    try {
      const data = await getLiveSamples(query, { 
        type: dateFilterType, 
        value: dateFilterType === 'all' ? undefined : dateValue 
      }, selectedUnitId)
      setSamples(data)
      setLastUpdated(new Date())
      const delayed = data.filter((s: SampleWithDetails) => s.status === 'DELAYED').length
      const overdue = data.filter((s: SampleWithDetails) => isOverdueTat(s)).length
      const totalAlerts = delayed + overdue
      if (!isAutoRefresh && totalAlerts > prevAlertCount) {
        toast.warning(`New issues detected: ${overdue} overdue TAT, ${delayed} delayed`)
      }
      setPrevAlertCount(totalAlerts)
    } catch (error) {
      if (!isAutoRefresh) toast.error('Failed to refresh samples')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [query, dateFilterType, dateValue, selectedUnitId, prevAlertCount])

  useEffect(() => {
    fetchSamples()
    const interval = setInterval(() => fetchSamples(true), 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchSamples])

  useEffect(() => {
    const id = searchParams.get('sample')
    if (!id) {
      setSelectedSample(null)
      return
    }
    const s = samples.find(x => x.id === id)
    if (s) setSelectedSample(s)
  }, [searchParams, samples])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSamples()
    }, 500)
    return () => clearTimeout(timer)
  }, [query, dateFilterType, dateValue])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COLLECTED': return 'bg-blue-100 text-blue-800'
      case 'RECEIVED': return 'bg-purple-100 text-purple-800'
      case 'IN_PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'AWAITING_REVIEW': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'DELAYED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <h2 className="text-lg font-medium text-gray-900 whitespace-nowrap">Live Updates</h2>
            <span className="text-xs text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              <span suppressHydrationWarning>
                {lastUpdated.toLocaleTimeString()}
              </span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search samples..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-md text-sm w-full md:w-64"
              />
            </div>

            <select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value as any)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Time</option>
              <option value="date">Specific Date</option>
              <option value="week">Week Of</option>
              <option value="month">Month Of</option>
              <option value="year">Year Of</option>
            </select>

            {dateFilterType !== 'all' && (
              <div className="relative">
                <input
                  type={dateFilterType === 'year' ? 'number' : dateFilterType === 'month' ? 'month' : 'date'}
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full md:w-auto"
                />
              </div>
            )}
            
            <button
              onClick={() => fetchSamples()}
              disabled={refreshing}
              className="cursor-pointer p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="pl-9 pr-8 py-2 border rounded-md text-sm w-52 bg-white"
            >
              <option value="ALL">All Units</option>
              {Array.from(new Map(samples.map(s => [s.unit.id, s.unit.name])).entries()).map(([id, name]) => (
                <option key={id} value={id as string}>{name as string}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm px-3 py-1 rounded-md bg-red-50 text-red-700">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {samples.filter(s => isOverdueTat(s)).length} overdue TAT
          </div>
          <div className="flex items-center text-sm px-3 py-1 rounded-md bg-orange-50 text-orange-700">
            <Bell className="w-4 h-4 mr-1" />
            {samples.filter(s => s.status === 'DELAYED').length} delayed
          </div>
          <button
            onClick={() => setShowIssuesOnly(v => !v)}
            className="cursor-pointer px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50"
          >
            {showIssuesOnly ? 'Show All' : 'Show Issues Only'}
          </button>
        </div>
      </div>

        {loading && samples.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accession</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showIssuesOnly ? samples.filter(s => s.status === 'DELAYED' || isOverdueTat(s)) : samples).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No samples found matching filters.</td>
                  </tr>
                ) : (
                  (showIssuesOnly ? samples.filter(s => s.status === 'DELAYED' || isOverdueTat(s)) : samples).map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.accession_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.lab_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.patient_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {sample.tests.map((t: SampleTest & { test: Test }) => (
                            <span key={t.test.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {t.test.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.unit.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sample.status)}`}>
                          {sample.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.created_by?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            const next = new URLSearchParams(searchParams.toString())
                            next.set('view', 'detail')
                            next.set('id', sample.id)
                            router.push(`${pathname}?${next.toString()}`)
                          }}
                          className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Sample Details */}
      {selectedSample && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedSample(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Sample Details
                  </h3>
                  <button onClick={() => {
                    const hasParam = !!searchParams.get('sample')
                    if (hasParam) {
                      router.back()
                    } else {
                      setSelectedSample(null)
                    }
                  }} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <SampleCard sample={selectedSample} canEditResults={true} userRole="ADMIN" readOnly={false} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
