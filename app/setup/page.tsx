'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/setup'
import type { CompleteOnboardingData } from '@/lib/zod/setup'

// Step components (will create these next)
import { WelcomeStep } from '@/components/setup/WelcomeStep'
import { PhysicalMetricsStep } from '@/components/setup/PhysicalMetricsStep'
import { ActivityLevelStep } from '@/components/setup/ActivityLevelStep'
import { GoalsStep } from '@/components/setup/GoalsStep'
import { SummaryStep } from '@/components/setup/SummaryStep'

type SetupStep = 'welcome' | 'metrics' | 'activity' | 'goals' | 'summary'

export default function SetupPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Partial<CompleteOnboardingData>>({})

    const steps: SetupStep[] = ['welcome', 'metrics', 'activity', 'goals', 'summary']
    const currentStepIndex = steps.indexOf(currentStep)
    const progress = ((currentStepIndex + 1) / steps.length) * 100

    const handleNext = (data?: Partial<CompleteOnboardingData>) => {
        if (data) {
            setFormData((prev) => ({ ...prev, ...data }))
        }

        const nextIndex = currentStepIndex + 1
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex])
        }
    }

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex])
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            const result = await completeOnboarding(formData as CompleteOnboardingData)

            if (result.success) {
                // Redirect to dashboard
                router.push('/dashboard')
                router.refresh()
            } else {
                alert(result.error || 'Failed to complete setup')
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error('Setup submission error:', error)
            alert('An unexpected error occurred')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Step {currentStepIndex + 1} of {steps.length}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {currentStep === 'welcome' && (
                        <WelcomeStep onNext={() => handleNext()} />
                    )}

                    {currentStep === 'metrics' && (
                        <PhysicalMetricsStep
                            initialData={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'activity' && (
                        <ActivityLevelStep
                            initialData={formData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'goals' && (
                        <GoalsStep
                            initialData={formData}
                            currentWeight={formData.weight_kg}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}

                    {currentStep === 'summary' && (
                        <SummaryStep
                            formData={formData as CompleteOnboardingData}
                            onBack={handleBack}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    <p>All information is private and used only for personalized nutrition calculations.</p>
                </div>
            </div>
        </div>
    )
}
