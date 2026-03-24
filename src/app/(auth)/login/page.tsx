import { login, signup } from './actions'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)]">
      {/* Left side cover image (hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <Image
          src="/assets/CornerView.jpg"
          alt="A spiritual journey showing calm earth tones"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <h2 className="text-[var(--bg)] font-cormorant text-4xl italic font-light">
            Your Quest will be Quenched.
          </h2>
          <p className="text-[var(--bg)]/90 mt-4 text-sm font-jost">
            Sign in to access your modules, join the weekly sessions, and walk the journey 
            toward the truth of who you are.
          </p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="font-cormorant text-4xl text-[var(--text)]">Her Quest</h1>
            <p className="text-[var(--text)]/70 mt-2 text-sm font-jost uppercase tracking-widest">
              Portal Access
            </p>
          </div>

          <form className="mt-10 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] font-jost">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:text-sm bg-[var(--surface)] text-[var(--text)] font-jost transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] font-jost">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:text-sm bg-[var(--surface)] text-[var(--text)] font-jost transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                formAction={login}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[#A36D48] font-jost transition-colors"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="w-full flex justify-center py-3 px-4 border border-[var(--accent)] rounded-md shadow-sm text-sm font-medium text-[var(--accent)] bg-transparent hover:bg-stone-50 font-jost transition-colors"
              >
                Create Account (Test)
              </button>
            </div>
            
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-[var(--bg)] text-xs text-stone-500 font-jost uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full flex justify-center py-3 px-4 border border-stone-300 rounded-md shadow-sm bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-colors font-jost"
              >
                Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
