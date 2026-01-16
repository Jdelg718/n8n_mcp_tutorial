import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
    onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="text-center space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome to Your Meal Tracker! 🎉
                </h1>
                <p className="text-lg text-gray-600">
                    Let's personalize your nutrition goals
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                <h2 className="font-semibold text-blue-900 mb-3">What we'll do:</h2>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                        <span className="mr-2">📊</span>
                        <span>Collect your physical metrics (weight, height, age)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">🏃</span>
                        <span>Determine your activity level</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">🎯</span>
                        <span>Set your health goals</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">🔬</span>
                        <span>Calculate your personalized nutrition targets</span>
                    </li>
                </ul>
            </div>

            <div className="text-sm text-gray-500">
                <p>This will take about 2 minutes.</p>
                <p>All data is private and encrypted.</p>
            </div>

            <Button onClick={onNext} size="lg" className="w-full sm:w-auto px-8">
                Get Started →
            </Button>
        </div>
    )
}
