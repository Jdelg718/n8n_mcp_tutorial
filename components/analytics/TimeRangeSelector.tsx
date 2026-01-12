'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type TimeRange = 'today' | '7d' | '30d' | '90d' | 'all'

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
]

export function TimeRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRange = (searchParams.get('range') || '7d') as TimeRange

  const handleRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams()
    params.set('range', range)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex gap-2 overflow-x-auto">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
              currentRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}
