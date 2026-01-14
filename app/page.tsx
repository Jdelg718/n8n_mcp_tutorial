import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation - Stripe-inspired */}
      <nav className="fixed top-0 left-0 right-0 z-50 blur-backdrop bg-white/90 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-purple transition-transform group-hover:scale-105"></div>
                <span className="text-xl font-bold text-gray-900">NutriTrack</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="text-gray-600 hover:text-gray-900 font-medium text-[15px] transition-colors">
                  About
                </Link>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-6">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-semibold text-[15px] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn bg-[#635bff] text-white hover:bg-[#5145e5] px-5 py-2.5 text-[15px] font-semibold shadow-sm hover:shadow-md transition-all"
              >
                Get started
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Hero Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 animate-fade-in mx-auto lg:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide">AI-Powered Nutrition Tracking</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.15] animate-fade-in-up delay-100">
                Data-driven <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">nutrition insights</span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
                Transform your health journey with intelligent meal tracking.
                Snap a photo, get instant nutritional analysis, and visualize your progress.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                <Link href="/signup" className="btn btn-primary px-8 py-3 text-base">
                  Start tracking free
                </Link>
                <Link href="#features" className="btn btn-secondary px-8 py-3 text-base">
                  How it works
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-[var(--color-text-secondary)] animate-fade-in delay-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  <span>Free tier available</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Dashboard Preview */}
            <div className="relative animate-scale-in delay-200 hidden lg:block">
              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-blue-100/50 rounded-full blur-3xl -z-10"></div>

              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Today's Nutrition</div>
                    <div className="text-xs text-gray-500">Jan 12, 2026</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-100"></div>
                </div>

                {/* Mock Progress Bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Calories', value: '1,847', target: '2,000', percent: 92, color: 'bg-blue-500' },
                    { label: 'Protein', value: '142g', target: '150g', percent: 95, color: 'bg-indigo-500' },
                    { label: 'Carbs', value: '205g', target: '250g', percent: 82, color: 'bg-teal-400' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-500">
                          {item.value} <span className="text-gray-300">/</span> {item.target}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-green-50 rounded-lg flex items-center gap-3 text-xs text-green-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    You're hitting your protein goals perfectly!
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-48 rotate-[3deg] hover:rotate-0 transition-transform duration-500 delay-100">
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0"></div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Grilled Salmon</div>
                    <div className="text-[10px] text-gray-500">Lunch • 12:30 PM</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  High Protein Meal 💪
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4">Everything you need to track nutrition</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              Powerful features that make meal tracking effortless and insights actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Analysis',
                description: 'Snap a photo or type a description. Our AI instantly analyzes nutrition content with high accuracy.',
              },
              {
                icon: '📊',
                title: 'Beautiful Analytics',
                description: 'Visualize your nutrition trends with elegant charts and get personalized AI-generated insights.',
              },
              {
                icon: '💬',
                title: 'Telegram Integration',
                description: 'Log meals directly from Telegram. Quick, convenient, and always accessible.',
              },
              {
                icon: '🎯',
                title: 'Goal Tracking',
                description: 'Set custom nutrition goals and track your progress with real-time feedback.',
              },
              {
                icon: '📱',
                title: 'Health App Sync',
                description: 'Connect with Apple Health and Google Fit for comprehensive health tracking.',
              },
              {
                icon: '🔒',
                title: 'Private & Secure',
                description: 'Your data is encrypted and private. We never share your information.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card p-8 space-y-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-white mb-6 text-5xl md:text-6xl font-bold">
            Start tracking your nutrition today
          </h2>
          <p className="text-xl text-white/95 mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            Join thousands of users who have transformed their health with intelligent nutrition tracking.
          </p>
          <Link
            href="/signup"
            className="btn bg-white text-gray-900 hover:bg-gray-50 text-lg px-10 py-5 inline-flex items-center font-semibold shadow-2xl hover:shadow-xl transition-all hover:scale-105"
          >
            Get started for free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-purple"></div>
              <span className="font-bold text-gray-900 text-lg">NutriTrack</span>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 NutriTrack. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
