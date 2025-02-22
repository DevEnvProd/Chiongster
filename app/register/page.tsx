"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Header from "@/components/header"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCodeInput, setReferralCodeInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  //const supabase = createClientComponentClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (authData.user) {
        // Function to generate a random alphanumeric referral code
        const generateReferralCode = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let code = "";
          for (let i = 0; i < 10; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
          }
          return code;
        };

        let referralCode = "";
        let isUnique = false;

        // Ensure referral code is unique
        while (!isUnique) {
          referralCode = generateReferralCode();
          const { data: existingCode } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .maybeSingle();

          if (!existingCode) {
            isUnique = true;
          }
        }

        let referrerId = null;

        // If a referral code was provided by the user, find the referrer's ID
        if (referralCodeInput) {
          const { data: referrerProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCodeInput)
            .maybeSingle();

          if (referrerProfile) {
            referrerId = referrerProfile.id;
          }
        }

        // Insert additional user data into profiles table
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            unique_id: authData.user.id,
            username,
            email,
            referral_code: referralCode,
            referrer: referrerId, // Store the referrer ID if available
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          throw profileError;
        }

        // Redirect to login page after successful registration
        router.push("/login");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Create account</h1>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Input Username"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400" htmlFor="email">
                  Email
                </label>
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

              <div className="space-y-2">
                <label className="text-sm text-zinc-400" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Input Password"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div className="space-y-2">
                <label className="text-sm text-zinc-400" htmlFor="username">
                  Referral Code
                </label>
                <Input
                  id="referral_code"
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Input Referral Code"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-12 text-white text-base font-medium bg-gradient-to-r from-[#8E2DE2] to-[#F000FF]",
                  "hover:from-[#7B27C1] hover:to-[#C000E0]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loading ? "Creating account..." : "CREATE ACCOUNT"}
              </Button>
            </form>

            <p className="text-center text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF1493] hover:text-[#FF1493]/90">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

