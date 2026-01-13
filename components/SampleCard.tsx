'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import type { Sample, SampleTest, Test, SampleStatusLog } from '@prisma/client'
import { updateSampleStatus, claimSampleTest, unclaimSampleTest, updateTestResult } from '@/app/actions'
import { formatDistanceToNow, addMinutes, isPast } from 'date-fns'
import { Clock, User, FileText, Edit2, Save, X } from 'lucide-react'

type SampleWithTests = Sample & {
  tests: (SampleTest & { test: Test })[]
  status_logs: SampleStatusLog[]
  processed_by?: { name: string | null } | null
}

export default function SampleCard({ 
  sample, 
  canEditResults = false,
  userRole,
  readOnly = false,
  currentUserId,
  showOnlyMyTests = false,
  selectedBenchIds
}: { 
  sample: SampleWithTests, 
  canEditResults?: boolean,
  userRole?: string,
  readOnly?: boolean,
  currentUserId?: string,
  showOnlyMyTests?: boolean,
  selectedBenchIds?: string[]
}) {
  const [loading, setLoading] = useState(false)
  const [showDelayInput, setShowDelayInput] = useState(false)
  const [delayReason, setDelayReason] = useState('')
  const [showLabNumberInput, setShowLabNumberInput] = useState(false)
  const [labNumberInput, setLabNumberInput] = useState('')
  const [editingTestId, setEditingTestId] = useState<string | null>(null)
  const [resultInput, setResultInput] = useState('')

  const effectiveCurrentUserId = currentUserId
  type CardTest = SampleTest & { test: (Test & { bench?: { name: string } | null }), assigned_to_id?: string | null, assigned_to?: { id: string, name: string | null } | null }
  const tests: CardTest[] = sample.tests as unknown as CardTest[]

  const canEdit = !readOnly && canEditResults && (
    userRole === 'LAB_SCIENTIST' ? (sample.status === 'IN_PROCESSING' || sample.status === 'AWAITING_REVIEW') : true
  )

  // Show results logic:
  // - Scientists/Admins always see the field to work on it (or review it)
  // - Others only see it if available (but handled by server action usually)
  // The requirement "Only show Result field for test after the test has been done"
  // implies we might want to hide the "Tests & Results" header or section content if there are no results 
  // AND the user isn't the one supposed to enter them.
  // But simpler interpretation: Just rely on canEdit logic and existing result display.
  
  const handleClaim = async (testId: string) => {
    try {
      await claimSampleTest(sample.id, testId)
      toast.success('Test claimed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to claim test')
    }
  }

  const handleUnclaim = async (testId: string) => {
    try {
      await unclaimSampleTest(sample.id, testId)
      toast.success('Test unclaimed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to unclaim test')
    }
  }

  const handleEditClick = (testId: string, currentResult: string | null) => {
    setEditingTestId(testId)
    setResultInput(currentResult || '')
  }

  const handleSaveResult = async (testId: string) => {
    try {
      await updateTestResult(sample.id, testId, resultInput)
      setEditingTestId(null)
      toast.success('Result saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save result')
    }
  }

  // Calculate TAT
  const maxTat = Math.max(...sample.tests.map((t: SampleTest & { test: Test }) => t.test.expected_tat_minutes))
  const expectedCompletion = addMinutes(new Date(sample.collected_at), maxTat)
  const isOverdue = isPast(expectedCompletion) && sample.status !== 'COMPLETED'
  
  // TAT Color
  const getTatColor = () => {
    if (sample.status === 'COMPLETED') return 'bg-green-100 border-green-200'
    if (isOverdue) return 'bg-red-50 border-red-200'
    
    const timeElapsed = Date.now() - new Date(sample.collected_at).getTime()
    const totalTime = maxTat * 60 * 1000
    const percentUsed = timeElapsed / totalTime
    
    if (percentUsed > 0.8) return 'bg-yellow-50 border-yellow-200'
    return 'bg-white border-gray-200'
  }

  const hasMyClaimedTests = tests.some(t => t.assigned_to_id === effectiveCurrentUserId)
  const allTestsHaveResults = tests.every(t => t.result && t.result.trim().length > 0)

  const handleStatusUpdate = async (newStatus: string) => {
    // If starting process and no lab number assigned yet, require it
    if (newStatus === 'IN_PROCESSING' && !sample.lab_number && !labNumberInput && !showLabNumberInput) {
      setShowLabNumberInput(true)
      return
    }

    setLoading(true)
    try {
      await updateSampleStatus(sample.id, newStatus, delayReason, labNumberInput || undefined)
      setShowDelayInput(false)
      setShowLabNumberInput(false)
      setDelayReason('')
      setLabNumberInput('')
      toast.success('Sample status updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${getTatColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex flex-col space-y-1 mb-1">
             <span className="text-xs font-mono text-gray-500 flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Acc: {sample.accession_number}
             </span>
             {sample.lab_number ? (
               <span className="text-xs font-mono text-indigo-600 font-bold flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Lab #: {sample.lab_number}
               </span>
             ) : (
                <span className="text-xs text-gray-400 italic">No Lab # yet</span>
             )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{sample.patient_name}</h3>
          <p className="text-xs text-gray-500">
            {sample.source} {sample.ward_id ? '• Ward' : '• OPD'}
          </p>
          {sample.processed_by?.name && (
            <div className="flex items-center text-xs text-indigo-600 mt-1 font-medium">
              <User className="w-3 h-3 mr-1" />
              Scientist: {sample.processed_by.name}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span suppressHydrationWarning>
              {formatDistanceToNow(new Date(sample.collected_at))} ago
            </span>
          </div>
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">
          {showOnlyMyTests ? 'My Tests & Results' : 'Tests & Results'}
        </p>
        <div className="space-y-2">
          {(() => {
            let base = ((userRole === 'LAB_SCIENTIST') && !readOnly)
              ? tests.filter((tt) => {
                  if (showOnlyMyTests) {
                    return tt.assigned_to_id === effectiveCurrentUserId
                  }
                  return true
                })
              : tests
            if (!showOnlyMyTests && selectedBenchIds && selectedBenchIds.length > 0) {
              base = base.filter(tt => tt.test.bench_id && selectedBenchIds.includes(tt.test.bench_id))
            }
            return base
          })().map((t) => (
            <div key={t.test_id} className="bg-gray-50 p-2 rounded-md text-sm border border-gray-100">
               <div className="flex justify-between items-start">
                 <div className="flex items-center space-x-2">
                   <span className="font-medium text-gray-900">{t.test.name}</span>
                   {t.test.bench_id ? (
                     <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                       {t.test.bench?.name || 'Bench'}
                     </span>
                   ) : (
                     <span className="text-xs text-gray-400 italic">No bench</span>
                   )}
                   {t.assigned_to?.name ? (
                     <span className={`text-xs px-2 py-0.5 rounded-full ${
                       t.assigned_to_id === effectiveCurrentUserId 
                         ? 'bg-indigo-100 text-indigo-700' 
                         : 'bg-gray-100 text-gray-600'
                     }`}>
                       {t.assigned_to_id === effectiveCurrentUserId ? 'Me' : t.assigned_to.name}
                     </span>
                   ) : (
                      !t.assigned_to_id && <span className="text-xs text-gray-400 italic">Unassigned</span>
                   )}
                 </div>
                 <div className="flex items-center space-x-2">
                   {userRole === 'LAB_SCIENTIST' && !readOnly && (
                    t.assigned_to_id && t.assigned_to_id === effectiveCurrentUserId ? (
                      !t.result && <button onClick={() => handleUnclaim(t.test_id)} className="cursor-pointer text-red-600 hover:text-red-800 text-xs">Unclaim</button>
                    ) : (
                      !t.assigned_to_id && ['RECEIVED','IN_PROCESSING','AWAITING_REVIEW','DELAYED'].includes(sample.status) && (
                        <button onClick={() => handleClaim(t.test_id)} className="cursor-pointer text-indigo-600 hover:text-indigo-800 text-xs">Claim</button>
                      )
                    )
                  )}
                   {canEdit && (userRole === 'ADMIN' || (t.assigned_to_id && t.assigned_to_id === effectiveCurrentUserId)) && (
                      editingTestId === t.test_id ? (
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleSaveResult(t.test_id)} className="cursor-pointer text-green-600 hover:text-green-800"><Save size={14} /></button>
                          <button onClick={() => setEditingTestId(null)} className="cursor-pointer text-red-600 hover:text-red-800"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(t.test_id, t.result)} className="cursor-pointer text-gray-400 hover:text-indigo-600" title="Edit Result">
                          <Edit2 size={12} />
                        </button>
                      )
                   )}
                 </div>
               </div>
               
               {editingTestId === t.test_id ? (
                 <input 
                   type="text" 
                   value={resultInput} 
                   onChange={e => setResultInput(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter') {
                       handleSaveResult(t.test_id)
                     } else if (e.key === 'Escape') {
                       setEditingTestId(null)
                     }
                   }}
                   className="mt-1 block w-full text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 p-1"
                   placeholder="Enter result..."
                   autoFocus
                 />
              ) : (
                <div className="mt-1 text-xs text-gray-600">
                  {t.result ? (
                    <span className="font-mono text-indigo-700 break-all">{t.result}</span>
                  ) : (
                    canEdit && (userRole === 'ADMIN' || (t.assigned_to_id && t.assigned_to_id === effectiveCurrentUserId)) ? <span className="italic text-gray-400">No result</span> : null
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900">
            Status: {sample.status.replace('_', ' ')}
          </span>
        </div>

        {!readOnly && (
        <>
        <div className="grid grid-cols-2 gap-2">
          {sample.status === 'COLLECTED' && (
            <button
              onClick={() => handleStatusUpdate('RECEIVED')}
              disabled={loading}
              className="w-full col-span-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Receive Sample
            </button>
          )}
          
          {sample.status === 'RECEIVED' && (
            <button
              onClick={() => handleStatusUpdate('IN_PROCESSING')}
              disabled={loading || (userRole === 'LAB_SCIENTIST' && !hasMyClaimedTests)}
              className="w-full col-span-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title={userRole === 'LAB_SCIENTIST' && !hasMyClaimedTests ? "Claim at least one test to start" : ""}
            >
              Start Process
            </button>
          )}

          {sample.status === 'IN_PROCESSING' && (
            <>
              <button
                onClick={() => handleStatusUpdate('AWAITING_REVIEW')}
                disabled={loading || (userRole === 'LAB_SCIENTIST' && (!hasMyClaimedTests || !allTestsHaveResults))}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={userRole === 'LAB_SCIENTIST' ? (!hasMyClaimedTests ? "You must claim tests first" : (!allTestsHaveResults ? "All tests must have results" : "")) : ""}
              >
                Send for Review
              </button>
              <button
                onClick={() => setShowDelayInput(true)}
                disabled={loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md bg-white text-red-600 border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report Delay
              </button>
            </>
          )}

          {sample.status === 'AWAITING_REVIEW' && (
             <button
             onClick={() => handleStatusUpdate('COMPLETED')}
             disabled={loading || (userRole === 'LAB_SCIENTIST' && !allTestsHaveResults)}
             className="col-span-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
             title={userRole === 'LAB_SCIENTIST' && !allTestsHaveResults ? "All tests must be completed first" : ""}
           >
             Approve & Complete
           </button>
          )}

          {sample.status === 'DELAYED' && (
            <button
              onClick={() => handleStatusUpdate('IN_PROCESSING')}
              disabled={loading}
              className="col-span-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resume Processing
            </button>
          )}
        </div>

        {showLabNumberInput && (
          <div className="mt-3 bg-gray-50 p-3 rounded-md border border-indigo-100">
            <label className="block text-xs font-medium text-gray-700 mb-1">Assign Lab Number</label>
            <input
              type="text"
              placeholder="Enter Lab Number (e.g. H-123)"
              value={labNumberInput}
              onChange={(e) => setLabNumberInput(e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                   setShowLabNumberInput(false)
                   setLabNumberInput('')
                }}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('IN_PROCESSING')}
                disabled={!labNumberInput}
                className="text-xs text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Assign & Start
              </button>
            </div>
          </div>
        )}

        {showDelayInput && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Reason for delay..."
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowDelayInput(false)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate('DELAYED')}
                disabled={!delayReason}
                className="text-xs text-white bg-red-600 px-2 py-1 rounded"
              >
                Confirm Delay
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
