'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { calculateNutritionGoals, calculateBMI } from '@/lib/nutrition/calculations'
import type { CompleteOnboardingData } from '@/lib/zod/setup'

interface SummaryStepProps {
    formData: CompleteOnboardingData
    onBack: () => void
    onSubmit: () => void
    isSubmitting: boolean
}

export function SummaryStep({ formData, onBack, onSubmit, isSubmitting }: SummaryStepProps) {
    const calculations = useMemo(() => {
        if (!formData.weight_kg || !formData.height_cm || !formData.birth_date) {
            return null
        }
        return calculateNutritionGoals(formData as any)
    }, [formData])

    const goalLabels = {
        weight_loss: 'Lose Weight',
        maintenance: 'Maintain Weight',
        muscle_gain: 'Build Muscle',
    }

    const activityLabels = {
        sedentary: 'Sedentary',
        lightly_active: 'Lightly Active',
        moderately_active: 'Moderately Active',
        very_active: 'Very Active',
        extra_active: 'Extra Active',
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Profile</h2>
                <p className="text-gray-600">
                    Check everything looks correct before we calculate your nutrition goals
                </p>
            </div>

            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-gray-600">Weight:</span>
                        <span className="ml-2 font-medium">{formData.weight_kg} kg</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Height:</span>
                        <span className="ml-2 font-medium">{formData.height_cm} cm</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Age:</span>
                        <span className="ml-2 font-medium">{calculations?.age} years</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Gender:</span>
                        <span className="ml-2 font-medium capitalize">{formData.gender}</span>
                    </div>
                </div>

                {calculations && (
                    <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">BMI:</span>
                        <span className="ml-2 font-medium">
                            {calculations.current_bmi} ({calculations.bmi_category})
                        </span>
                    </div>
                )}
            </div>

            {/* Activity & Goals */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Activity & Goals</h3>

                <div className="space-y-2 text-sm">
                    <div>
                        <span className="text-gray-600">Activity Level:</span>
                        <span className="ml-2 font-medium">
                            {activityLabels[formData.activity_level]}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Goal:</span>
                        <span className="ml-2 font-medium">
                            {goalLabels[formData.goal_type]}
                        </span>
                    </div>
                    {formData.target_weight_kg && (
                        <div>
                            <span className="text-gray-600">Target Weight:</span>
                            <span className="ml-2 font-medium">{formData.target_weight_kg} kg</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Calculated Nutrition Targets */}
            {calculations && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-green-900 mb-3">
                        🎯 Your Personalized Nutrition Targets
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-green-600">
                                {calculations.daily_calorie_goal}
                            </div>
                            <div className="text-xs text-gray-600">Calories/day</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-blue-600">
                                {calculations.daily_protein_goal}g
                            </div>
                            <div className="text-xs text-gray-600">Protein/day</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-orange-600">
                                {calculations.daily_carbs_goal}g
                            </div>
                            <div className="text-xs text-gray-600">Carbs/day</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-yellow-600">
                                {calculations.daily_fat_goal}g
                            </div>
                            <div className="text-xs text-gray-600">Fat/day</div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-green-200">
                        <div>
                            <span className="font-medium">BMR:</span> {calculations.bmr} kcal/day
                        </div>
                        <div>
                            <span className="font-medium">TDEE:</span> {calculations.tdee} kcal/day
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    💡 These targets are calculated using the Mifflin-St Jeor equation and are personalized to your body metrics and goals. You can update them anytime in your profile settings.
                </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    ← Back
                </Button>
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? 'Saving...' : 'Complete Setup ✓'}
                </Button>
            </div>
        </div>
    )
}
