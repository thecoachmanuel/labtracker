'use client'

import { useState } from 'react'
import { getSamplePublicStatus } from '@/app/actions'
import { Loader2, CheckCircle2, Clock } from 'lucide-react'

type PublicTestStatus = {
  found: boolean
  status?: string
  unitName?: string | null
  isResultsReady?: boolean
  tests?: { name: string; hasResult: boolean }[]
}

export default function TrackResultForm({ settings }: { settings: { logoUrl?: string | null, logoTitle: string } }) {
  const [accession, setAccession] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PublicTestStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setData(null)
    if (!accession.trim()) {
      setError('Please enter your accession number')
      return
    }
    setLoading(true)
    try {
      const res = await getSamplePublicStatus(accession.trim())
      setData(res)
    } catch (err) {
      setError('Unable to fetch status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="Logo" className="mx-auto h-16 w-auto mb-4 object-contain" />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Track Result</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">Enter your accession number to check if your test results are ready.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={accession}
              onChange={e => setAccession(e.target.value)}
              placeholder="Accession Number"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking...</>) : 'Check Status'}
          </button>
        </form>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        {data && (
          <div className="mt-6">
            {!data.found ? (
              <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">No record found for this accession number.</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {data.isResultsReady ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">
                    {data.isResultsReady ? 'Results are ready' : 'Results not ready yet'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Status: {data.status}</div>
                <div className="text-sm text-gray-600">Unit: {data.unitName || 'N/A'}</div>
                <div className="pt-2">
                  <h2 className="text-sm font-semibold">Tests</h2>
                  <ul className="mt-2 space-y-1">
                    {(data.tests || []).map((t) => (
                      <li key={t.name} className="flex justify-between text-sm">
                        <span className="text-gray-700">{t.name}</span>
                        <span className={t.hasResult ? 'text-green-600' : 'text-gray-500'}>
                          {t.hasResult ? 'Result ready' : 'Pending'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}