'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logWeight } from '@/app/dashboard/weight/actions'
import { kgToLbs, lbsToKg } from '@/lib/utils/units'
import { calculateBMI, getBMICategory } from '@/lib/utils/weight-utils'

type WeightEntryFormProps = {
    currentWeight?: number
    heightCm?: number
    onSuccess?: () => void
    onCancel?: () => void
}

export function WeightEntryForm({ currentWeight, heightCm, onSuccess, onCancel }: WeightEntryFormProps) {
    const [useImperial, setUseImperial] = useState(true)
    const [weight, setWeight] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        const weightNum = parseFloat(weight)
        if (isNaN(weightNum)) {
            setError('Please enter a valid weight')
            setIsSubmitting(false)
            return
        }

        // Convert to kg if imperial
        const weightKg = useImperial ? lbsToKg(weightNum) : weightNum

        const result = await logWeight({
            weight: weightKg,
            date: new Date(date).toISOString(),
        })

        setIsSubmitting(false)

        if (result.success) {
            setWeight('')
            onSuccess?.()
        } else {
            setError(result.error || 'Failed to log weight')
        }
    }

    const previewBMI = weight && heightCm
        ? calculateBMI(useImperial ? lbsToKg(parseFloat(weight)) : parseFloat(weight), heightCm)
        : null

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                        Imperial (lbs)
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseImperial(false)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!useImperial
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Metric (kg)
                    </button>
                </div>
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
                <Label htmlFor="weight">
                    Weight {useImperial ? '(lbs)' : '(kg)'}
                </Label>
                <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder={useImperial ? 'e.g., 165' : 'e.g., 75'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                />
                {currentWeight && (
                    <p className="text-sm text-gray-600">
                        Current: {useImperial ? kgToLbs(currentWeight).toFixed(1) : currentWeight.toFixed(1)} {useImperial ? 'lbs' : 'kg'}
                    </p>
                )}
            </div>

            {/* Date Input */}
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                />
                <p className="text-xs text-gray-500">
                    Defaults to today. You can log past entries.
                </p>
            </div>

            {/* BMI Preview */}
            {previewBMI && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                        BMI: <strong>{previewBMI.toFixed(1)}</strong> ({getBMICategory(previewBMI)})
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Logging...' : 'Log Weight'}
                </Button>
            </div>
        </form>
    )
}
