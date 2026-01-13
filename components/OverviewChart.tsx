'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = {
  name: string
  Collected: number
  Completed: number
}

export default function OverviewChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Collected" fill="#4f46e5" />
          <Bar dataKey="Completed" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
