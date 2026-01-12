'use client'

import { DailyNutrition } from '@/app/dashboard/analytics/actions'
import { format, parseISO } from 'date-fns'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

type CalorieTrendsChartProps = {
  data: DailyNutrition[]
  dateRange: string
}

export function CalorieTrendsChart({ data, dateRange }: CalorieTrendsChartProps) {
  // Transform data for Recharts - format dates for x-axis
  const chartData = data.map(day => ({
    ...day,
    formattedDate: format(parseISO(day.date), 'MMM d'),
    fullDate: format(parseISO(day.date), 'MMMM d, yyyy'),
  }))

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily Calorie Trends</h2>
        <p className="text-sm text-gray-600 mb-6">{dateRange}</p>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No data available for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily Calorie Trends</h2>
      <p className="text-sm text-gray-600 mb-6">{dateRange}</p>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
                    <p className="font-semibold text-gray-900 mb-2">{data.fullDate}</p>
                    <p className="text-blue-600">Calories: {data.calories} kcal</p>
                    <p className="text-purple-600">Protein: {data.protein}g</p>
                    <p className="text-orange-600">Carbs: {data.carbs}g</p>
                    <p className="text-amber-600">Fat: {data.fat}g</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Calories"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
