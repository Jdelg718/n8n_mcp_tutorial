import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TodayTotals } from '@/components/dashboard/TodayTotals'
import { RecentMeals } from '@/components/dashboard/RecentMeals'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">{user?.email}</p>
      </div>

      {/* Main content - 2 columns on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TodayTotals />
        </div>
        <div>
          <RecentMeals />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/meals/new"
            className="block px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center font-medium"
          >
            Log New Meal
          </Link>
          <Link
            href="/dashboard/meals"
            className="block px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center font-medium"
          >
            View All Meals
          </Link>
        </div>
      </div>
    </div>
  )
}
