'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PhysicalMetricsSchema, type PhysicalMetricsData } from '@/lib/zod/setup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { kgToLbs, lbsToKg, cmToInches, inchesToCm, inchesToFeetInches, feetInchesToInches } from '@/lib/utils/units'

interface PhysicalMetricsStepProps {
    initialData?: Partial<PhysicalMetricsData>
    onNext: (data: PhysicalMetricsData) => void
    onBack: () => void
}

export function PhysicalMetricsStep({ initialData, onNext, onBack }: PhysicalMetricsStepProps) {
    // Default to imperial units (US standard)
    const [useImperial, setUseImperial] = useState(true)

    // For imperial height input (feet and inches separately)
    const [heightFeet, setHeightFeet] = useState(() => {
        if (initialData?.height_cm) {
            const totalInches = cmToInches(initialData.height_cm)
            return inchesToFeetInches(totalInches).feet
        }
        return 5
    })
    const [heightInches, setHeightInches] = useState(() => {
        if (initialData?.height_cm) {
            const totalInches = cmToInches(initialData.height_cm)
            return inchesToFeetInches(totalInches).inches
        }
        return 10
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PhysicalMetricsData>({
        resolver: zodResolver(PhysicalMetricsSchema),
        defaultValues: initialData,
    })

    const currentWeight = watch('weight_kg')
    const currentHeight = watch('height_cm')

    // Set initial height_cm value from feet/inches on mount
    useEffect(() => {
        if (useImperial && !initialData?.height_cm) {
            const totalInches = feetInchesToInches(heightFeet, heightInches)
            setValue('height_cm', inchesToCm(totalInches))
        }
    }, []) // Only run on mount

    const onSubmit = (data: PhysicalMetricsData) => {
        onNext(data)
    }

    const handleWeightChange = (value: string) => {
        const num = parseFloat(value)
        if (isNaN(num)) return

        if (useImperial) {
            // Convert lbs to kg for storage
            setValue('weight_kg', lbsToKg(num))
        } else {
            setValue('weight_kg', num)
        }
    }

    const handleHeightChange = (value: string, isMetric: boolean) => {
        const num = parseFloat(value)
        if (isNaN(num)) return

        if (isMetric) {
            setValue('height_cm', num)
        } else {
            // For imperial, handled via feet/inches inputs
            const totalInches = feetInchesToInches(heightFeet, heightInches)
            setValue('height_cm', inchesToCm(totalInches))
        }
    }

    const handleFeetChange = (value: string) => {
        const feet = parseInt(value) || 0
        setHeightFeet(feet)
        const totalInches = feetInchesToInches(feet, heightInches)
        setValue('height_cm', inchesToCm(totalInches))
    }

    const handleInchesChange = (value: string) => {
        const inches = parseInt(value) || 0
        setHeightInches(inches)
        const totalInches = feetInchesToInches(heightFeet, inches)
        setValue('height_cm', inchesToCm(totalInches))
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Physical Metrics</h2>
                <p className="text-gray-600">
                    We need this information to calculate your nutrition targets
                </p>
            </div>

            {/* Unit Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setUseImperial(true)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${useImperial
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Imperial (lbs, ft/in)
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseImperial(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!useImperial
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Metric (kg, cm)
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Weight */}
                <div className="space-y-2">
                    <Label htmlFor="weight">
                        Current Weight {useImperial ? '(lbs)' : '(kg)'}
                    </Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder={useImperial ? 'e.g., 165' : 'e.g., 75'}
                        defaultValue={
                            currentWeight
                                ? useImperial
                                    ? kgToLbs(currentWeight).toFixed(1)
                                    : currentWeight.toFixed(1)
                                : ''
                        }
                        onChange={(e) => handleWeightChange(e.target.value)}
                    />
                    {errors.weight_kg && (
                        <p className="text-sm text-red-600">{errors.weight_kg.message}</p>
                    )}
                </div>

                {/* Height */}
                {useImperial ? (
                    <div className="space-y-2">
                        <Label>Height</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Feet"
                                    min="3"
                                    max="8"
                                    value={heightFeet}
                                    onChange={(e) => handleFeetChange(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Feet</p>
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    placeholder="Inches"
                                    min="0"
                                    max="11"
                                    value={heightInches}
                                    onChange={(e) => handleInchesChange(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Inches</p>
                            </div>
                        </div>
                        {/* Hidden field to register height_cm with form */}
                        <input
                            type="hidden"
                            {...register('height_cm', { valueAsNumber: true })}
                        />
                        {errors.height_cm && (
                            <p className="text-sm text-red-600">{errors.height_cm.message}</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="height_cm">Height (cm)</Label>
                        <Input
                            id="height_cm"
                            type="number"
                            placeholder="e.g., 175"
                            {...register('height_cm', { valueAsNumber: true })}
                        />
                        {errors.height_cm && (
                            <p className="text-sm text-red-600">{errors.height_cm.message}</p>
                        )}
                    </div>
                )}

                {/* Birth Date */}
                <div className="space-y-2">
                    <Label htmlFor="birth_date">Date of Birth</Label>
                    <Input
                        id="birth_date"
                        type="date"
                        {...register('birth_date')}
                    />
                    {errors.birth_date && (
                        <p className="text-sm text-red-600">{errors.birth_date.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Used to calculate your age for BMR formula
                    </p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label htmlFor="gender">Biological Gender</Label>
                    <select
                        id="gender"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        {...register('gender')}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select...
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other/Prefer not to say</option>
                    </select>
                    {errors.gender && (
                        <p className="text-sm text-red-600">{errors.gender.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Biological gender affects BMR calculations
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        ← Back
                    </Button>
                    <Button type="submit" className="flex-1">
                        Continue →
                    </Button>
                </div>
            </form>
        </div>
    )
}
