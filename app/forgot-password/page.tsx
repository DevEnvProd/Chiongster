'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input Email"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-500 text-center">
                Password reset instructions have been sent to your email.
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 text-white text-base font-medium bg-gradient-to-r from-[#8E2DE2] to-[#F000FF]",
                "hover:from-[#7B27C1] hover:to-[#C000E0]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Sending...' : 'SEND RESET INSTRUCTIONS'}
            </Button>
          </form>

          <p className="text-center text-zinc-400">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-[#FF1493] hover:text-[#FF1493]/90"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

