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
    <div className="min-h-screen gradient-mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-stripe-dark">Welcome back</span>
          </h1>
          <p className="text-gray-600 text-xl">{user?.email}</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Today's Totals Card */}
          <div className="animate-fade-in-up delay-100">
            <TodayTotals />
          </div>

          {/* Recent Meals Card */}
          <div className="animate-fade-in-up delay-200">
            <RecentMeals />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-10 animate-fade-in-up delay-300">
          <h3 className="text-3xl font-bold mb-8 text-stripe-dark">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/dashboard/meals/new"
              className="group card p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 border border-gray-100 hover:border-purple-200 hover:-translate-y-1 rounded-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-purple flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg">
                ✏️
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1.5 text-lg">Log Meal</div>
                <div className="text-sm text-gray-600">Add new entry</div>
              </div>
            </Link>

            <Link
              href="/dashboard/meals"
              className="group card p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 border border-gray-100 hover:border-blue-200 hover:-translate-y-1 rounded-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-blue flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg">
                📋
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1.5 text-lg">View Meals</div>
                <div className="text-sm text-gray-600">Browse history</div>
              </div>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="group card p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 border border-gray-100 hover:border-cyan-200 hover:-translate-y-1 rounded-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-ocean flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg">
                📊
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1.5 text-lg">Analytics</div>
                <div className="text-sm text-gray-600">View insights</div>
              </div>
            </Link>

            <Link
              href="/dashboard/profile"
              className="group card p-8 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4 border border-gray-100 hover:border-gray-300 hover:-translate-y-1 rounded-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-700 text-2xl group-hover:scale-110 transition-transform shadow-lg">
                ⚙️
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1.5 text-lg">Settings</div>
                <div className="text-sm text-gray-600">Manage profile</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
