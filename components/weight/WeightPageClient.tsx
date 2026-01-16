'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WeightEntryForm } from '@/components/weight/WeightEntryForm'
import { WeightStatsCards } from '@/components/weight/WeightStatsCards'
import { WeightChart } from '@/components/weight/WeightChart'
import { WeightHistoryTable } from '@/components/weight/WeightHistoryTable'
import { getWeightStats, getWeightHistory, type WeightStats, type WeightEntry } from '@/app/dashboard/weight/actions'
import { useRouter } from 'next/navigation'

type WeightPageClientProps = {
    initialStats: WeightStats
    initialHistory: WeightEntry[]
    currentWeight?: number
    heightCm?: number
}

export function WeightPageClient({ initialStats, initialHistory, currentWeight, heightCm }: WeightPageClientProps) {
    const router = useRouter()
    const [showEntryForm, setShowEntryForm] = useState(false)
    const [useImperial, setUseImperial] = useState(true)

    const handleSuccess = () => {
        setShowEntryForm(false)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
                    <p className="text-gray-600 mt-1">Track your progress toward your goal</p>
                </div>
                <div className="flex gap-3">
                    {/* Unit Toggle */}
                    <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                        <button
                            onClick={() => setUseImperial(true)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${useImperial
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            lbs
                        </button>
                        <button
                            onClick={() => setUseImperial(false)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${!useImperial
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            kg
                        </button>
                    </div>
                    <Button onClick={() => setShowEntryForm(!showEntryForm)}>
                        {showEntryForm ? 'Cancel' : '+ Log Weight'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <WeightStatsCards stats={initialStats} useImperial={useImperial} />

            {/* Entry Form (Conditional) */}
            {showEntryForm && (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Log New Weight</h2>
                    <WeightEntryForm
                        currentWeight={currentWeight}
                        heightCm={heightCm}
                        onSuccess={handleSuccess}
                        onCancel={() => setShowEntryForm(false)}
                    />
                </div>
            )}

            {/* Weight Chart */}
            <WeightChart
                entries={initialHistory}
                targetWeight={initialStats.target}
                useImperial={useImperial}
            />

            {/* Weight History Table */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Weight History</h2>
                <WeightHistoryTable
                    entries={initialHistory}
                    useImperial={useImperial}
                    onDelete={() => router.refresh()}
                />
            </div>
        </div>
    )
}
