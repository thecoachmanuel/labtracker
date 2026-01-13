'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

type SLAData = {
  name: string
  compliance: number
  total: number
  overdue: number
}

export default function SLACharts({ unitData, testData }: { unitData: SLAData[], testData: SLAData[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SLA Compliance by Unit (30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unitData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value}% (${props.payload.total - props.payload.overdue}/${props.payload.total})`, 
                  'Compliance'
                ]}
              />
              <Legend />
              <Bar dataKey="compliance" name="Compliance %" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                {unitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.compliance < 80 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lowest Compliance Tests (Bottom 10)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={testData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                 formatter={(value: any, name: any, props: any) => [
                  `${value}% (${props.payload.total - props.payload.overdue}/${props.payload.total})`, 
                  'Compliance'
                ]}
              />
              <Legend />
              <Bar dataKey="compliance" name="Compliance %" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                 {testData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.compliance < 80 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
