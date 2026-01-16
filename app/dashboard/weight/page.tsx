import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeightStats, getWeightHistory } from './actions'
import { WeightPageClient } from '@/components/weight/WeightPageClient'

export default async function WeightPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_kg, height_cm, profile_completed')
        .eq('id', user.id)
        .single()

    // Redirect to onboarding if profile not completed
    if (!profile?.profile_completed) {
        redirect('/setup')
    }

    // Fetch weight stats and history
    const stats = await getWeightStats()
    const history = await getWeightHistory(50)

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <WeightPageClient
                    initialStats={stats}
                    initialHistory={history}
                    currentWeight={profile.weight_kg || undefined}
                    heightCm={profile.height_cm || undefined}
                />
            </div>
        </div>
    )
}
