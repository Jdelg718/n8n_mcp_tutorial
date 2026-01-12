import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Meal Tracker</h2>
        <p className="text-gray-600 mb-4">
          You're logged in as: <strong>{user?.email}</strong>
        </p>
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-500 mb-3">
            Dashboard content coming in Phase 4. For now, you can:
          </p>
          <div className="space-y-3">
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
            <Link
              href="/dashboard/profile"
              className="block text-blue-600 hover:text-blue-800 underline text-sm text-center"
            >
              View your profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
