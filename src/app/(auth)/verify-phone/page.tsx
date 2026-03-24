import { sendVerificationCode, verifyCode } from './actions'

export default function VerifyPhonePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg)]">
      <div className="w-full max-w-md space-y-8 bg-[var(--surface)] p-10 rounded-xl shadow-sm border border-stone-200">
        <div className="text-center">
          <h1 className="font-cormorant text-3xl text-[var(--text)]">Security Verification</h1>
          <p className="text-[var(--text)]/70 mt-3 text-sm font-jost">
            To keep your portal secure, we use two-factor authentication. 
            Please enter your mobile number.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)] font-jost">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1234567890"
                  className="appearance-none block w-full px-4 py-3 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:text-sm bg-[var(--bg)] text-[var(--text)] font-jost"
                />
              </div>
              <button
                formAction={sendVerificationCode}
                className="mt-3 text-sm text-[var(--accent)] hover:text-[#A36D48] font-medium transition-colors"
                type="submit"
              >
                Send Verification Code
              </button>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <label htmlFor="code" className="block text-sm font-medium text-[var(--text)] font-jost">
                Security Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="123456"
                  className="appearance-none block w-full px-4 py-3 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:text-sm bg-[var(--bg)] text-[var(--text)] font-jost tracking-widest text-center"
                />
              </div>
            </div>
          </div>

          <button
            formAction={verifyCode}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent)] hover:bg-[#A36D48] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-colors font-jost tracking-wide mt-6"
          >
            Verify & Continue
          </button>
        </form>
      </div>
    </div>
  )
}
