"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { AdminHeader } from "@/components/admin/header"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign in with Supabase
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (authData?.user) {
        // Check manager profile status and get the id
        const { data: profileData, error: profileError } = await supabase
          .from("manager_profiles")
          .select("id, account_status")
          .eq("email", email)
          .single()

        if (profileError) throw profileError

        if (!profileData) {
          throw new Error("Manager profile not found")
        }

        if (profileData.account_status !== "approved") {
          throw new Error("Your account is pending approval")
        }

        // Store session data
        localStorage.setItem(
          "adminSession",
          JSON.stringify({
            user: {
              email: authData.user.email,
              id: authData.user.id,
              managerProfileId: profileData.id,
            },
          }),
        )

        // If remember me is not checked, set expiry
        if (!rememberMe) {
          const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
          localStorage.setItem("adminSessionExpiry", expiryTime.toString())
        }

        router.push("/admin/bookings")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AdminHeader />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Merchant Login</h1>

            <form onSubmit={handleLogin} className="space-y-6">
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

              <div className="space-y-2">
                <label className="text-sm text-zinc-400" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Input Password"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                    className="border-zinc-600 data-[state=checked]:bg-[#8E2DE2] data-[state=checked]:border-[#8E2DE2]"
                  />
                  <label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Link href="/admin/forgot-password" className="text-sm text-[#FF1493] hover:text-[#FF1493]/90">
                  FORGOT PASSWORD
                </Link>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 text-white text-base font-medium bg-gradient-to-r from-[#8E2DE2] to-[#F000FF]",
                  "hover:from-[#7B27C1] hover:to-[#C000E0]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loading ? "Logging in..." : "LOG IN"}
              </Button>
            </form>
            <p className="text-center text-zinc-400">
              Don't have a merchant account?{" "}
              <Link href="/admin/register" className="text-[#FF1493] hover:text-[#FF1493]/90">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

