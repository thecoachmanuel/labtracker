'use client'

import { useState } from 'react'
import { searchSamples } from '@/app/actions'
import { SampleWithDetails } from '@/types'
import { toast } from 'sonner'
import { Search, Loader2 } from 'lucide-react'

export default function SampleSearch() {
  const [query, setQuery] = useState('')
  const [samples, setSamples] = useState<SampleWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const results = await searchSamples(query)
      setSamples(results)
      setHasSearched(true)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Search Samples</h2>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Patient Name, Accession or Lab Number..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
        </button>
      </form>

      {hasSearched && (
        <div className="mt-4">
          {samples.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No samples found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accession #</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab #</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {samples.map((sample) => (
                    <tr key={sample.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sample.accession_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.lab_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sample.unit.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${sample.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                            sample.status === 'DELAYED' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {sample.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sample.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
