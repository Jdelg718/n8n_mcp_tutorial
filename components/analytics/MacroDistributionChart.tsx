'use client'

import { MacroDistribution } from '@/app/dashboard/analytics/actions'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'

type MacroDistributionChartProps = {
  data: MacroDistribution
}

export function MacroDistributionChart({ data }: MacroDistributionChartProps) {
  // Transform data for Recharts pie chart
  const chartData = [
    { name: 'Protein', value: data.protein, color: '#ef4444' },
    { name: 'Carbs', value: data.carbs, color: '#3b82f6' },
    { name: 'Fat', value: data.fat, color: '#f59e0b' },
  ]

  const totalGrams = data.protein + data.carbs + data.fat

  if (totalGrams === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Macro Distribution</h2>
        <p className="text-sm text-gray-600 mb-6">Protein, Carbs, Fat</p>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No nutrition data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Macro Distribution</h2>
      <p className="text-sm text-gray-600 mb-6">Protein, Carbs, Fat</p>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            labelLine={false}
            label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : '0%'}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0]
                const percent = ((data.value as number) / totalGrams) * 100
                return (
                  <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
                    <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
                    <p className="text-gray-700">Grams: {data.value}g</p>
                    <p className="text-gray-700">Percentage: {percent.toFixed(1)}%</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
