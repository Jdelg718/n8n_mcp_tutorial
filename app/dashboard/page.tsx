import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TodayTotals } from '@/components/dashboard/TodayTotals'
import { RecentMeals } from '@/components/dashboard/RecentMeals'
import { ProfileCompletionBanner } from '@/components/dashboard/ProfileCompletionBanner'
import { getUserGoals } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's nutrition goals
  const goalsResult = await getUserGoals()
  const goals = 'error' in goalsResult ? null : goalsResult
  const showProfileBanner = !goals || !goals.profileCompleted

  return (

    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header - Compact & Clean */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Overview</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Welcome back, {user?.email}</p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-3">
            <Link
              href="/dashboard/meals/new"
              className="btn btn-primary"
            >
              <span>+ Log Meal</span>
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Totals - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion Banner */}
            {showProfileBanner && <ProfileCompletionBanner />}

            {/* Totals Section */}
            <div className="mb-6">
              <TodayTotals goals={goals} />
            </div>

            {/* Recent Meals Section */}
            <div>
              <RecentMeals />
            </div>
          </div>

          {/* Sidebar / Quick Stats / Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                <Link href="/dashboard/meals" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">View All Meals</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
                <Link href="/dashboard/weight" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚖️</span>
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">Weight Tracking</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
                <Link href="/dashboard/analytics" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">Analytics</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
                <Link href="/dashboard/profile" className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">Settings</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
