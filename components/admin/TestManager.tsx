'use client'

import { useState } from 'react'
import type { Test, Unit, Bench } from '@prisma/client'
import { createTest, deleteTest, assignTestToBench } from '@/app/actions'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2, Filter } from 'lucide-react'

type TestWithUnit = Test & { unit: Unit }

export default function TestManager({ 
  tests, 
  units, 
  benches, 
  currentUserRole,
  currentUserUnitId
}: { 
  tests: TestWithUnit[], 
  units: Unit[], 
  benches?: Bench[], 
  currentUserRole?: string,
  currentUserUnitId?: string
}) {
  const [name, setName] = useState('')
  const [unitId, setUnitId] = useState(currentUserRole === 'UNIT_ADMIN' ? currentUserUnitId || '' : '')
  const [tat, setTat] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL')

  const filteredTests = tests.filter(test => 
    selectedUnit === 'ALL' || test.unit_id === selectedUnit
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !unitId || !tat) return

    setLoading(true)
    try {
      await createTest({
        name,
        unit_id: unitId,
        expected_tat_minutes: parseInt(tat)
      })
      setName('')
      setTat('')
      // Reset unitId only if not Unit Admin
      if (currentUserRole !== 'UNIT_ADMIN') {
        setUnitId('')
      }
      toast.success('Test created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteTest(id)
      toast.success('Test deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete test')
    }
  }

  const handleBenchChange = async (testId: string, benchId: string) => {
    try {
      await assignTestToBench(testId, benchId || null)
      toast.success('Test assigned to bench')
    } catch (e) {
      toast.error('Failed to assign bench')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Test Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        
        {currentUserRole !== 'UNIT_ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="">Select Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">TAT (Minutes)</label>
          <input
            type="number"
            value={tat}
            onChange={(e) => setTat(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="sm:col-span-1 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Test
          </button>
        </div>
      </form>

      {currentUserRole !== 'UNIT_ADMIN' && (
        <div className="flex justify-end">
          <div className="relative inline-block text-left w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
            >
              <option value="ALL">All Units</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTests.map((test) => (
            <li key={test.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-600 truncate">{test.name}</p>
                  <p className="text-sm text-gray-500">
                    {test.unit.name} • {test.expected_tat_minutes} mins TAT
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {benches && (
                  <select
                    value={test.bench_id || ''}
                    onChange={(e) => handleBenchChange(test.id, e.target.value)}
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                  >
                    <option value="">No Bench Assigned</option>
                    {benches
                      .filter(b => b.unit_id === test.unit_id)
                      .map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    }
                  </select>
                )}
                <button
                  onClick={() => handleDelete(test.id)}
                  className="cursor-pointer text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
