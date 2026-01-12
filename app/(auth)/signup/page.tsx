import Link from 'next/link'
import SignUpForm from '@/components/auth/SignUpForm'
import OAuthButtons from '@/components/auth/OAuthButtons'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <SignUpForm />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <OAuthButtons />
      </div>
    </div>
  )
}
