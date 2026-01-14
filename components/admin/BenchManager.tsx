'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Unit, Bench } from '@prisma/client'
import { createBench, deleteBench } from '@/app/actions'
import { Plus, Trash2, Search, AlertCircle, Filter } from 'lucide-react'

const benchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit_id: z.string().min(1, 'Unit is required')
})

type BenchForm = z.infer<typeof benchSchema>

export default function BenchManager({ 
  benches, 
  units,
  currentUserRole,
  currentUserUnitId
}: { 
  benches: Bench[], 
  units: Unit[],
  currentUserRole: string,
  currentUserUnitId?: string
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BenchForm>({
    resolver: zodResolver(benchSchema),
    defaultValues: {
      unit_id: currentUserRole === 'UNIT_ADMIN' ? currentUserUnitId : ''
    }
  })

  const filteredBenches = benches.filter(bench => {
    const matchesSearch = bench.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUnit = selectedUnit === 'ALL' || bench.unit_id === selectedUnit
    return matchesSearch && matchesUnit
  })

  const onSubmit = async (data: BenchForm) => {
    try {
      setError('')
      await createBench(data.name, data.unit_id)
      reset({ unit_id: currentUserRole === 'UNIT_ADMIN' ? currentUserUnitId : '' })
      setIsCreating(false)
    } catch {
      setError('Failed to create bench. It might already exist.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    try {
      setError('')
      await deleteBench(id)
    } catch {
      setError('Failed to delete bench. Ensure no tests are assigned to it.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search benches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {currentUserRole !== 'UNIT_ADMIN' && (
          <div className="ml-3 relative">
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
        )}

        <button
          onClick={() => setIsCreating(true)}
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bench
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Bench Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {currentUserRole !== 'UNIT_ADMIN' && (
                <div>
                  <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    {...register('unit_id')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id.message}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  reset()
                  setError('')
                }}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Bench'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {currentUserRole !== 'UNIT_ADMIN' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
              )}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBenches.map(bench => (
              <tr key={bench.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bench.name}
                </td>
                {currentUserRole !== 'UNIT_ADMIN' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {units.find(u => u.id === bench.unit_id)?.name || 'Unknown'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(bench.id)}
                    className="cursor-pointer text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
