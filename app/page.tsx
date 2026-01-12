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
      <section className="relative pt-40 pb-32 gradient-mesh-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">AI-Powered Nutrition Tracking</span>
              </div>

              <h1 className="animate-fade-in-up delay-100">
                <span className="text-stripe-red">Track your</span>{' '}
                <span className="text-stripe-dark">nutrition</span>{' '}
                <span className="gradient-text-blue">with AI</span>{' '}
                <span className="text-stripe-dark">intelligence</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed text-balance animate-fade-in-up delay-200">
                Transform your health journey with intelligent meal tracking, instant AI analysis,
                and personalized insights that help you reach your nutrition goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <Link href="/signup" className="btn btn-primary text-lg px-8 py-4">
                  Start tracking free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="#features" className="btn btn-secondary text-lg px-8 py-4">
                  See how it works
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600 animate-fade-in delay-400">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free forever</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Dashboard Preview */}
            <div className="relative animate-scale-in delay-200">
              <div className="glass-card rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Today's Nutrition</h3>
                  <span className="text-sm text-gray-500">Jan 12, 2026</span>
                </div>

                {/* Mock Progress Bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Calories', value: '1,847', target: '2,000', percent: 92, color: 'bg-gradient-purple' },
                    { label: 'Protein', value: '142g', target: '150g', percent: 95, color: 'bg-gradient-blue' },
                    { label: 'Carbs', value: '205g', target: '250g', percent: 82, color: 'bg-gradient-ocean' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-gray-600">
                          {item.value} / {item.target}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-1000`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">3 meals logged today</span>
                    <span className="text-green-600 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      On track
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
