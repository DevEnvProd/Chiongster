"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Header from "@/components/header"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  // const supabase = createClientComponentClient()

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
        // Fetch the corresponding profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("unique_id", authData.user.id)
          .single()

        if (profileError) throw profileError

        if (!profileData) throw new Error("Profile not found")

        // Store both IDs in localStorage
        localStorage.setItem("supabaseUserId", authData.user.id)
        localStorage.setItem("profileId", profileData.id)

        // Set session in localStorage for our custom session management
        localStorage.setItem(
          "session",
          JSON.stringify({
            user: {
              email: authData.user.email,
              supabaseUserId: authData.user.id,
              profileId: profileData.id,
            },
          }),
        )

        // If remember me is not checked, we'll set up session expiry
        if (!rememberMe) {
          const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
          localStorage.setItem("sessionExpiry", expiryTime.toString())
        }

        router.push("/")
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
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Log In</h1>

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
                <Link href="/forgot-password" className="text-sm text-[#FF1493] hover:text-[#FF1493]/90">
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
              Don't have an account?{" "}
              <Link href="/register" className="text-[#FF1493] hover:text-[#FF1493]/90">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

