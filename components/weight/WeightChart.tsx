'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { WeightEntry } from '@/app/dashboard/weight/actions'
import { kgToLbs } from '@/lib/utils/units'

type WeightChartProps = {
    entries: WeightEntry[]
    targetWeight?: number | null
    useImperial: boolean
}

export function WeightChart({ entries, targetWeight, useImperial }: WeightChartProps) {
    if (entries.length === 0) {
        return (
            <div className="card flex items-center justify-center" style={{ height: 300 }}>
                <p className="text-gray-500">No data to display yet</p>
            </div>
        )
    }

    //Sort entries by date ascending for chart
    const sortedEntries = [...entries].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )

    const chartData = sortedEntries.map(entry => ({
        date: new Date(entry.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: useImperial ? kgToLbs(entry.weight) : entry.weight,
    }))

    const targetValue = targetWeight && useImperial ? kgToLbs(targetWeight) : targetWeight

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                            value: useImperial ? 'Weight (lbs)' : 'Weight (kg)',
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        formatter={(value: any) => [
                            value ? `${Number(value).toFixed(1)} ${useImperial ? 'lbs' : 'kg'}` : 'N/A',
                            'Weight'
                        ]}
                    />
                    {targetValue && (
                        <ReferenceLine
                            y={targetValue}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            label={{ value: 'Target', position: 'right', fill: '#10b981' }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
