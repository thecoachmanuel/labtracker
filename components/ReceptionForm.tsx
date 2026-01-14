'use client'

import { useState, useEffect } from 'react'
import { createSample } from '@/app/actions'
import { Unit, Test, Ward } from '@prisma/client'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Search, X } from 'lucide-react'

const formSchema = z.object({
  patient_name: z.string().min(2, 'Patient name must be at least 2 characters'),
  age: z.string().optional(),
  gender: z.string().optional(),
  clinical_info: z.string().optional(),
  specimen_type: z.string().optional(),
  ward_id: z.string().optional(),
  unit_id: z.string().min(1, 'Please select a lab unit'),
  test_ids: z.array(z.string()).min(1, 'Please select at least one test')
})

type FormValues = z.infer<typeof formSchema>

export default function ReceptionForm({
  units,
  tests,
  wards,
  currentUserUnitId
}: {
  units: Unit[]
  tests: Test[]
  wards: Ward[]
  currentUserUnitId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [testSearch, setTestSearch] = useState('')
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      test_ids: [],
      unit_id: currentUserUnitId || '',
      gender: ''
    }
  })

  const selectedUnitId = watch('unit_id')
  const selectedTestIds = watch('test_ids')

  // Filter tests based on selected unit and search term
  const filteredTests = tests.filter(test => {
    const matchesUnit = selectedUnitId ? test.unit_id === selectedUnitId : true
    const matchesSearch = test.name.toLowerCase().includes(testSearch.toLowerCase())
    return matchesUnit && matchesSearch
  })

  // When unit changes, clear selected tests that don't belong to the new unit
  // Actually, if we filter the list, the checkboxes might still be checked in RHF state.
  // We should probably clear selection if unit changes.
  useEffect(() => {
    // If unit is selected, remove tests that are not in that unit
    if (selectedUnitId) {
       const validTestIds = tests.filter(t => t.unit_id === selectedUnitId).map(t => t.id)
       const newSelection = selectedTestIds.filter(id => validTestIds.includes(id))
       if (newSelection.length !== selectedTestIds.length) {
         setValue('test_ids', newSelection)
       }
    }
  }, [selectedUnitId, tests, setValue, selectedTestIds])

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const sample = await createSample({
        patient_name: data.patient_name,
        age: data.age,
        gender: data.gender,
        clinical_info: data.clinical_info,
        specimen_type: data.specimen_type,
        source: data.ward_id ? 'WARD' : 'OPD',
        ward_id: data.ward_id === '' ? undefined : data.ward_id,
        unit_id: data.unit_id,
        test_ids: data.test_ids
      })
      toast.success(`Sample registered! Accession Number: ${sample.accession_number}`)
      reset({
        test_ids: [],
        unit_id: currentUserUnitId || '',
        gender: '',
        patient_name: '',
        age: '',
        clinical_info: '',
        specimen_type: '',
        ward_id: ''
      })
      setTestSearch('')
    } catch {
      toast.error('Failed to register sample')
    } finally {
      setLoading(false)
    }
  }

  const handleTestToggle = (testId: string) => {
    const current = selectedTestIds || []
    const updated = current.includes(testId)
      ? current.filter(id => id !== testId)
      : [...current, testId]
    setValue('test_ids', updated)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Patient Details */}
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            {...register('patient_name')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Full Name"
          />
          {errors.patient_name && <p className="mt-1 text-sm text-red-600">{errors.patient_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            {...register('age')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. 25, 2y 3m"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            {...register('gender')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700">Clinical Summary & Diagnosis</label>
          <textarea
            {...register('clinical_info')}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Brief clinical history and provisional diagnosis..."
          />
        </div>

        {/* Ward Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <select
            {...register('ward_id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="">Select Ward (Optional)</option>
            {wards.map(ward => (
              <option key={ward.id} value={ward.id}>{ward.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Specimen Collected</label>
          <input
            {...register('specimen_type')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. Blood, Urine, Swab"
          />
        </div>

        {/* Unit Selection (Locked if assigned) */}
        {!currentUserUnitId ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Lab Unit</label>
            <select
              {...register('unit_id')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="">Select Unit</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
            {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id.message}</p>}
          </div>
        ) : (
          <input type="hidden" {...register('unit_id')} value={currentUserUnitId} />
        )}
      </div>

      {/* Test Selection */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tests Required</label>
        
        {!selectedUnitId ? (
          <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-md text-center">
            Please select a Lab Unit to see available tests.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search tests..."
              />
              {testSearch && (
                 <button
                   type="button"
                   onClick={() => setTestSearch('')}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
                 >
                   <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                 </button>
              )}
            </div>

            {/* Selected Tests Summary */}
            {selectedTestIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                 {selectedTestIds.map(id => {
                   const t = tests.find(x => x.id === id)
                   return t ? (
                     <span key={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                       {t.name}
                       <button
                         type="button"
                         onClick={() => handleTestToggle(id)}
                         className="cursor-pointer ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600"
                       >
                         <span className="sr-only">Remove</span>
                         <X className="h-3 w-3" />
                       </button>
                     </span>
                   ) : null
                 })}
              </div>
            )}

            {/* Test List */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto p-2 border rounded-md bg-gray-50">
              {filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <div 
                    key={test.id} 
                    onClick={() => handleTestToggle(test.id)}
                    className={`
                      relative flex items-center p-3 rounded-md cursor-pointer border transition-colors
                      ${selectedTestIds.includes(test.id) 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-white border-gray-200 hover:border-indigo-300'}
                    `}
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={selectedTestIds.includes(test.id)}
                        onChange={() => {}} // handled by div click
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-medium text-gray-900 block">{test.name}</span>
                      <span className="text-gray-500 text-xs">{test.expected_tat_minutes} min</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                  No tests found matching "{testSearch}" in this unit.
                </div>
              )}
            </div>
            {errors.test_ids && <p className="mt-1 text-sm text-red-600">{errors.test_ids.message}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Registering...
            </span>
          ) : (
            'Register Sample'
          )}
        </button>
      </div>
    </form>
  )
}
