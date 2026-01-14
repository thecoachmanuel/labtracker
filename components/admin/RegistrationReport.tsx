'use client'

import { useState, useEffect } from 'react'
import { Unit } from '@prisma/client'
import { getRegistrationReport } from '@/app/actions'
import { Calendar, Filter, Loader2, FileDown, FlaskConical } from 'lucide-react'
import { format } from 'date-fns'

export default function RegistrationReport({ 
  units,
  userRole
}: { 
  units: Unit[],
  userRole: string
}) {
  const [loading, setLoading] = useState(false)
  type ReportSample = {
    id: string
    created_at: string | Date
    accession_number: string
    lab_number?: string | null
    patient_name: string
    unit: { id: string; name: string }
    tests: { test_id: string; test: { name: string } }[]
    status: string
    created_by?: { name: string | null }
  }
  const [data, setData] = useState<ReportSample[]>([])
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'month' | 'all'>('day')
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchReport()
  }, [selectedUnit, dateFilter, dateValue])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const result = await getRegistrationReport({
        unitId: selectedUnit,
        dateFilter,
        date: dateValue
      })
      setData(result)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getTitle = () => {
    if (dateFilter === 'all') return 'All Time Report'
    const date = new Date(dateValue)
    if (dateFilter === 'day') return `Daily Report - ${format(date, 'PPP')}`
    if (dateFilter === 'week') return `Weekly Report - Week of ${format(date, 'PPP')}`
    if (dateFilter === 'month') return `Monthly Report - ${format(date, 'MMMM yyyy')}`
    return 'Sample Report'
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          nav, footer {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .print-hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
            font-size: 10px !important;
          }
          th, td {
            padding: 4px 8px !important;
          }
        }
      `}</style>
      {/* Controls - Hidden when printing */}
      <div className="bg-white p-4 rounded-lg shadow print:hidden">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {userRole === 'ADMIN' && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Units</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'day' | 'week' | 'month' | 'all')}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="all">All Time</option>
              </select>
              
              {dateFilter !== 'all' && (
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              )}
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="cursor-pointer flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export / Print
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white p-8 rounded-lg shadow print:shadow-none print:p-0">
        {/* Print Header */}
        <div className="hidden print:block mb-6 border-b-2 border-indigo-600 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Logo - Designed to look like a site logo */}
              <div className="w-16 h-16 bg-indigo-700 rounded-xl flex items-center justify-center text-white logo-bg shadow-sm border border-indigo-800">
                <FlaskConical className="w-10 h-10" />
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 inline-block mb-2">
                <p className="text-lg font-bold text-gray-900">{getTitle()}</p>
              </div>
              <p className="text-xs text-gray-500 font-medium" suppressHydrationWarning>Generated: {new Date().toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Screen Header */}
        <div className="print:hidden mb-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">{getTitle()}</h2>
          <span className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${data.length} records found`}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accession #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((sample) => (
                  <tr key={sample.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sample.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sample.accession_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sample.lab_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sample.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.unit.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {sample.tests.map((t: { test_id: string; test: { name: string } }) => (
                          <span key={t.test_id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {t.test.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${sample.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          sample.status === 'DELAYED' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {sample.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.created_by?.name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No samples found for the selected criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
