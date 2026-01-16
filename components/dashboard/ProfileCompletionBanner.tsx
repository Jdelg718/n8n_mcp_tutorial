import Link from 'next/link'

export function ProfileCompletionBanner() {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-900 mb-1">
                        Complete Your Profile
                    </h3>
                    <p className="text-sm text-amber-800 mb-3">
                        Get personalized nutrition goals based on your body metrics, activity level, and health goals.
                    </p>
                    <Link
                        href="/setup"
                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
                    >
                        Complete Profile →
                    </Link>
                </div>
            </div>
        </div>
    )
}
