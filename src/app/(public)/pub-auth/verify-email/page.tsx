import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-center p-10">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-500 mb-8 font-medium leading-relaxed">
          We've sent a verification link to your email address. Please click the link to verify your account and complete the registration.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors">
            Go to Login
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            Didn't receive the email? Check your spam folder or try registering again.
          </p>
        </div>
      </div>
    </div>
  )
}
