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
          <p className="text-sm text-gray-500">
            Dashboard content coming in Phase 4. For now, you can:
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View your profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
