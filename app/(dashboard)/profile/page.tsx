import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Re-authorize
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {profile?.full_name || 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member Since
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">
            Profile editing will be added in Phase 7: Settings & Profile
          </p>
        </div>
      </div>
    </div>
  )
}
