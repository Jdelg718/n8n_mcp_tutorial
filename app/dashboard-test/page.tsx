import { createClient } from '@/lib/supabase/server'

export default async function DashboardTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Dashboard Test</h1>
      <p>User: {user?.email || 'Not logged in'}</p>
    </div>
  )
}
