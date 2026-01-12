import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import OAuthButtons from '@/components/auth/OAuthButtons'

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-purple transition-transform group-hover:scale-105 shadow-lg"></div>
            <span className="text-2xl font-bold text-stripe-dark">NutriTrack</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-stripe-dark">Welcome back</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#635bff] hover:text-[#5145e5] font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-10 space-y-8 shadow-2xl">
          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/90 px-6 text-gray-600 font-medium backdrop-blur-sm">Or continue with</span>
            </div>
          </div>

          <OAuthButtons />
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
