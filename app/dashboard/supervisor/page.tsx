import { getSupervisorStats, getSLAStats } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import OverviewChart from '@/components/OverviewChart'
import SLACharts from '@/components/SLACharts'
import { AlertTriangle, Clock, Activity } from 'lucide-react'

interface UnitStat {
  id: string
  name: string
  _count: {
    samples: number
  }
}

export default async function SupervisorDashboard() {
  const [stats, slaStats] = await Promise.all([
    getSupervisorStats(),
    getSLAStats()
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Supervisor Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSamples}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Samples</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.delayedSamples}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated / Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.escalatedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Samples overdue &gt; 4h
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.escalatedSamples.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Escalation Required ({stats.escalatedSamples.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
             {stats.escalatedSamples.map((s: any) => (
               <div key={s.id} className="bg-white p-3 rounded shadow-sm border border-red-100 flex justify-between items-center">
                 <div>
                   <p className="font-medium text-red-900">{s.accession_number}</p>
                   <p className="text-sm text-red-700">{s.patient_name}</p>
                 </div>
                 <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">
                   {s.status.replace('_', ' ')}
                 </span>
               </div>
             ))}
          </div>
        </div>
      )}

      <OverviewChart data={stats.chartData} />
      
      <SLACharts unitData={slaStats.byUnit} testData={slaStats.byTest} />

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Unit Performance</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {stats.unitStats.map((unit: UnitStat) => (
              <li key={unit.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {unit.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {unit._count.samples} Active Samples
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
