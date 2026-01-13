'use client'

import { useState, useEffect, useCallback } from 'react'
import { getReceptionistSamples } from '@/app/actions'
import { SampleWithDetails } from '@/types'
import { RefreshCw, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ReceptionistSampleList() {
  const [samples, setSamples] = useState<SampleWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchSamples = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setRefreshing(true)
    try {
      const data = await getReceptionistSamples()
      setSamples(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch samples', error)
      if (!isAutoRefresh) toast.error('Failed to refresh samples')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSamples()
    const interval = setInterval(() => fetchSamples(true), 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchSamples])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 mr-1" />
      case 'DELAYED': return <AlertCircle className="w-4 h-4 mr-1" />
      default: return <Clock className="w-4 h-4 mr-1" />
    }
  }

  if (loading && samples.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">My Recent Registrations</h2>
          <p className="text-xs text-gray-500 mt-1">
            Live updates • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => fetchSamples()}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh now"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tests
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {samples.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No samples registered yet.
                </td>
              </tr>
            ) : (
              samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sample.accession_number}</div>
                    {sample.lab_number && (
                      <div className="text-xs text-gray-500">Lab: {sample.lab_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sample.patient_name}</div>
                    <div className="text-xs text-gray-500">
                      {sample.age ? `${sample.age} • ` : ''}{sample.gender || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {sample.tests.map((t: any) => (
                        <span 
                          key={t.test.id} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {t.test.name}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{sample.unit.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sample.status)}`}>
                      {getStatusIcon(sample.status)}
                      {sample.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sample.created_at).toLocaleDateString()}
                    <div className="text-xs">
                      {new Date(sample.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
