'use client'

import { WeightStats } from '@/app/dashboard/weight/actions'
import { formatWeight } from '@/lib/utils/weight-utils'

type WeightStatsCardsProps = {
    stats: WeightStats
    useImperial: boolean
}

export function WeightStatsCards({ stats, useImperial }: WeightStatsCardsProps) {
    const { current, target, starting, totalChange, progressPercentage, remaining, goalType } = stats

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Weight Card */}
            <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Current Weight</h3>
                <p className="text-3xl font-bold text-gray-900">
                    {current ? formatWeight(current, useImperial) : 'N/A'}
                </p>
                {starting && (
                    <p className="text-sm text-gray-500 mt-2">
                        Started at {formatWeight(starting, useImperial)}
                    </p>
                )}
            </div>

            {/* Target Weight Card */}
            <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Target Weight</h3>
                <p className="text-3xl font-bold text-gray-900">
                    {target ? formatWeight(target, useImperial) : 'N/A'}
                </p>
                {goalType && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${goalType === 'weight_loss' ? 'bg-blue-100 text-blue-800' :
                            goalType === 'muscle_gain' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {goalType === 'weight_loss' ? 'Weight Loss' :
                            goalType === 'muscle_gain' ? 'Muscle Gain' :
                                'Maintenance'}
                    </span>
                )}
            </div>

            {/* Progress Card */}
            <div className="card">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Progress</h3>
                <p className={`text-3xl font-bold ${totalChange < 0 ? 'text-green-600' : totalChange > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                    {totalChange !== 0 ? (totalChange > 0 ? '+' : '') : ''}
                    {formatWeight(Math.abs(totalChange), useImperial).replace(' lbs', '').replace(' kg', '')}
                </p>
                {target && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{progressPercentage}% to goal</span>
                            <span>{formatWeight(Math.abs(remaining), useImperial).replace(' lbs', '').replace(' kg', '')} to go</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
