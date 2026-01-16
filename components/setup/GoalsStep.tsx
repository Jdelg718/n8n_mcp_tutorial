'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoalsSchema, type GoalsData } from '@/lib/zod/setup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { kgToLbs, lbsToKg } from '@/lib/utils/units'

interface GoalsStepProps {
    initialData?: Partial<GoalsData>
    currentWeight?: number
    onNext: (data: GoalsData) => void
    onBack: () => void
}

const goalTypes = [
    {
        value: 'weight_loss',
        label: 'Lose Weight',
        description: '20% calorie deficit',
        icon: '📉',
        expectedRate: '~0.5 kg/week',
    },
    {
        value: 'maintenance',
        label: 'Maintain Weight',
        description: 'Balanced calories',
        icon: '⚖️',
        expectedRate: 'No change',
    },
    {
        value: 'muscle_gain',
        label: 'Build Muscle',
        description: '10% calorie surplus',
        icon: '💪',
        expectedRate: '~0.25 kg/week',
    },
] as const

export function GoalsStep({ initialData, currentWeight, onNext, onBack }: GoalsStepProps) {
    // Default to imperial units for consistency with PhysicalMetricsStep
    const [useImperial, setUseImperial] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<GoalsData>({
        resolver: zodResolver(GoalsSchema),
        defaultValues: initialData,
    })

    const selectedGoal = watch('goal_type')
    const showTargetWeight = selectedGoal !== 'maintenance'

    const handleTargetWeightChange = (value: string) => {
        const num = parseFloat(value)
        if (isNaN(num)) return

        if (useImperial) {
            // Convert lbs to kg for storage
            setValue('target_weight_kg', lbsToKg(num))
        } else {
            setValue('target_weight_kg', num)
        }
    }

    const onSubmit = (data: GoalsData) => {
        // Set target_weight_kg to null for maintenance
        if (data.goal_type === 'maintenance') {
            data.target_weight_kg = null
        }
        onNext(data)
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Your Goal</h2>
                <p className="text-gray-600">
                    What would you like to achieve?
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Goal Type Selection */}
                <div className="space-y-3">
                    {goalTypes.map((goal) => (
                        <label
                            key={goal.value}
                            className={`
                block p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedGoal === goal.value
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }
              `}
                        >
                            <div className="flex items-start">
                                <input
                                    type="radio"
                                    value={goal.value}
                                    {...register('goal_type')}
                                    className="mt-1 mr-3"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{goal.icon}</span>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {goal.label}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {goal.description}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Expected: {goal.expectedRate}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.goal_type && (
                    <p className="text-sm text-red-600">{errors.goal_type.message}</p>
                )}

                {/* Target Weight (conditional) */}
                {showTargetWeight && (
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        {/* Unit Toggle */}
                        <div className="flex justify-center mb-3">
                            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setUseImperial(true)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${useImperial
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    lbs
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseImperial(false)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!useImperial
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    kg
                                </button>
                            </div>
                        </div>

                        <Label htmlFor="target_weight">
                            Target Weight {useImperial ? '(lbs)' : '(kg)'}
                        </Label>
                        {currentWeight && (
                            <p className="text-sm text-gray-600">
                                Current: {useImperial ? kgToLbs(currentWeight).toFixed(1) : currentWeight.toFixed(1)} {useImperial ? 'lbs' : 'kg'}
                            </p>
                        )}
                        <Input
                            id="target_weight"
                            type="number"
                            step="0.1"
                            placeholder={useImperial ? 'e.g., 155' : 'e.g., 70.0'}
                            onChange={(e) => handleTargetWeightChange(e.target.value)}
                        />
                        {errors.target_weight_kg && (
                            <p className="text-sm text-red-600">{errors.target_weight_kg.message}</p>
                        )}
                    </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Important:</strong> Sustainable weight changes happen gradually. We'll calculate safe targets based on your goal.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        ← Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!selectedGoal}>
                        Continue →
                    </Button>
                </div>
            </form>
        </div>
    )
}
