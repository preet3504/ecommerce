"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShoppingBag, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false
    })

    if (result?.error) {
      setError("Invalid credentials")
      setLoading(false)
    } else {
      // Fetch session to check user role
      const response = await fetch("/api/auth/session")
      const session = await response.json()
      
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else {
        router.push("/products")
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-accent-100 to-accent-50 animate-gradient relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-accent-300/60 to-accent-200/40 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-tl from-accent-400/50 to-accent-300/30 rounded-full blur-3xl animate-pulse-slow delay-300" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-secondary/10 to-accent-300/40 rounded-full blur-2xl animate-float" />
      </div>

      <div className="max-w-md w-full animate-fadeIn">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center animate-float">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-secondary">E-Store</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Welcome Back!</h1>
          <p className="text-accent-600">Sign in to continue shopping</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-accent-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 animate-fadeIn">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-secondary font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 border border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-secondary font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-11 pr-12 py-3 border border-accent-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-600 hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-3 rounded-xl hover:bg-accent-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-accent-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-secondary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center text-sm text-accent-600">
          <p>🔒 Secure login • 🚀 Fast access • ⭐ Trusted by thousands</p>
        </div>
      </div>
    </div>
  )
}
