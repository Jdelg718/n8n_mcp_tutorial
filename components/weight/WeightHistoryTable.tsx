'use client'

import { useState } from 'react'
import { WeightEntry } from '@/app/dashboard/weight/actions'
import { formatWeight, calculateWeightChange } from '@/lib/utils/weight-utils'
import { kgToLbs } from '@/lib/utils/units'
import { Button } from '@/components/ui/button'
import { deleteWeightEntry } from '@/app/dashboard/weight/actions'

type WeightHistoryTableProps = {
    entries: WeightEntry[]
    useImperial: boolean
    onDelete?: () => void
}

export function WeightHistoryTable({ entries, useImperial, onDelete }: WeightHistoryTableProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this weight entry?')) return

        setDeletingId(id)
        const result = await deleteWeightEntry(id)
        setDeletingId(null)

        if (result.success) {
            onDelete?.()
        } else {
            alert(result.error || 'Failed to delete entry')
        }
    }

    if (entries.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">No weight entries yet</p>
                <p className="text-sm text-gray-400">Start tracking your weight to see your progress!</p>
            </div>
        )
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Weight</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">BMI</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Change</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {entries.map((entry, index) => {
                            const previousEntry = entries[index + 1]
                            const change = previousEntry
                                ? calculateWeightChange(entry.weight, previousEntry.weight)
                                : null

                            return (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {new Date(entry.recorded_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {formatWeight(entry.weight, useImperial)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {entry.bmi ? entry.bmi.toFixed(1) : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {change ? (
                                            <span
                                                className={
                                                    change.direction === 'down' ? 'text-green-600' :
                                                        change.direction === 'up' ? 'text-red-600' :
                                                            'text-gray-600'
                                                }
                                            >
                                                {change.direction === 'down' ? '↓' : change.direction === 'up' ? '↑' : '→'}
                                                {' '}
                                                {Math.abs(useImperial ? kgToLbs(change.amount) : change.amount).toFixed(1)}
                                                {' '}
                                                {useImperial ? 'lbs' : 'kg'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deletingId === entry.id}
                                        >
                                            {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
