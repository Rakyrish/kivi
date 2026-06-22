'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, AlertCircle, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import { SITE } from '@/lib/constants'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { token } = await api.login(username, password)
      // Store token in a secure, HTTP-only-like cookie
      document.cookie = `admin_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="bg-[#00A0C0] p-3 rounded-sm text-[#002040]">
              <Activity size={28} strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="font-display font-black text-2xl text-[#F4F7FA] uppercase tracking-wide">
            {SITE.shortName} Admin
          </h1>
          <p className="text-xs text-[#606060] uppercase tracking-widest font-bold">
            Secure Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#081525] border border-[#00A0C0]/20 p-8 rounded-[4px] shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-950/60 border border-red-500/30 text-red-200 p-4 rounded-[2px] text-xs">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
                className="w-full bg-[#002040]/40 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-3 text-xs focus:outline-none transition-colors rounded-[2px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] uppercase font-bold tracking-wider text-[#606060] block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full bg-[#002040]/40 border border-[#00A0C0]/15 focus:border-[#00A0C0] text-[#F4F7FA] px-4 py-3 text-xs focus:outline-none transition-colors rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#00A0C0] text-[#002040] hover:bg-[#00A0E0] disabled:opacity-60 transition-colors font-bold text-xs uppercase tracking-wider rounded-[2px] mt-2"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Authenticating...</>
              ) : (
                <><Lock size={14} /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#606060]">
          Staff accounts are created in the Django Admin panel.
        </p>
      </div>
    </div>
  )
}
