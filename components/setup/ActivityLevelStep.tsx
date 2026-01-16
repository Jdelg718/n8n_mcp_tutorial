'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActivityLevelSchema, type ActivityLevelData } from '@/lib/zod/setup'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ActivityLevelStepProps {
    initialData?: Partial<ActivityLevelData>
    onNext: (data: ActivityLevelData) => void
    onBack: () => void
}

const activityLevels = [
    {
        value: 'sedentary',
        label: 'Sedentary',
        description: 'Little to no exercise',
        examples: 'Desk job, minimal activity',
        multiplier: '1.2x BMR',
    },
    {
        value: 'lightly_active',
        label: 'Lightly Active',
        description: 'Exercise 1-3 days/week',
        examples: 'Light gym sessions, walking',
        multiplier: '1.375x BMR',
    },
    {
        value: 'moderately_active',
        label: 'Moderately Active',
        description: 'Exercise 3-5 days/week',
        examples: 'Regular workouts, active lifestyle',
        multiplier: '1.55x BMR',
    },
    {
        value: 'very_active',
        label: 'Very Active',
        description: 'Exercise 6-7 days/week',
        examples: 'Intense daily training',
        multiplier: '1.725x BMR',
    },
    {
        value: 'extra_active',
        label: 'Extra Active',
        description: 'Intense exercise + physical job',
        examples: 'Athlete, construction worker',
        multiplier: '1.9x BMR',
    },
] as const

export function ActivityLevelStep({ initialData, onNext, onBack }: ActivityLevelStepProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ActivityLevelData>({
        resolver: zodResolver(ActivityLevelSchema),
        defaultValues: initialData,
    })

    const selectedLevel = watch('activity_level')

    const onSubmit = (data: ActivityLevelData) => {
        onNext(data)
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Activity Level</h2>
                <p className="text-gray-600">
                    How active are you on a typical week?
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-3">
                    {activityLevels.map((level) => (
                        <label
                            key={level.value}
                            className={`
                block p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedLevel === level.value
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }
              `}
                        >
                            <div className="flex items-start">
                                <input
                                    type="radio"
                                    value={level.value}
                                    {...register('activity_level')}
                                    className="mt-1 mr-3"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {level.label}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {level.description}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {level.examples}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 ml-4">
                                            {level.multiplier}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.activity_level && (
                    <p className="text-sm text-red-600">{errors.activity_level.message}</p>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Be honest with your activity level. Overestimating can lead to weight gain, underestimating may cause fatigue.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        ← Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!selectedLevel}>
                        Continue →
                    </Button>
                </div>
            </form>
        </div>
    )
}
