import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/api'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        showToast('Welcome back to DreamShops!', 'success')
        navigate('/')
      } else {
        await signup({ firstName, lastName, email, password })
        showToast('Account created! Signing you in...', 'success')
        await login(email, password)
        navigate('/')
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setMode('login')
    setEmail(demoEmail)
    setPassword('123456')
  }

  return (
    <div className="py-14 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#E6E3DC] bg-white overflow-hidden shadow-sm">
        <div className="lg:col-span-5 bg-[#0D2D23] text-[#F7F4EE] p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#DCE7DF]">DreamShops account</p>
            <h1 className="font-serif-editorial text-4xl font-medium mt-2 leading-tight">
              Sign in to DreamShops
            </h1>
            <p className="text-sm text-[#DCE7DF]/85 mt-4 leading-relaxed">
              Manage your cart, track orders, or open Admin studio to publish new products.
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-white/15 space-y-3">
            <p className="text-xs text-[#DCE7DF] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" strokeWidth={1.5} />
              <span>Demo accounts (password: 123456)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('user1@email.com')}
                className="rounded-lg border border-white/25 hover:bg-white/10 px-3 py-1.5 text-xs font-mono-code cursor-pointer"
              >
                user1@email.com
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin1@email.com')}
                className="rounded-lg bg-[#DCE7DF] text-[#0D2D23] font-medium px-3 py-1.5 text-xs font-mono-code cursor-pointer"
              >
                admin1@email.com (Admin)
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 sm:p-10">
          <div className="inline-flex rounded-full border border-[#E6E3DC] bg-[#F8F7F4] p-1 mb-7">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`relative px-6 py-2 rounded-full text-xs font-semibold cursor-pointer ${
                  mode === tab ? 'text-white' : 'text-[#627069] hover:text-[#14221C]'
                }`}
              >
                {mode === tab && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-full bg-[#0D2D23]"
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aarav"
                      className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mehta"
                      className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] h-11 px-6 text-sm font-medium transition-colors duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : mode === 'login' ? 'Sign in' : 'Create account'}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
