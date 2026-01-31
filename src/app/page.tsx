import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, Truck, Shield, Star, TrendingUp, Package } from "lucide-react"
import CounterStats from "@/components/CounterStats"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard")
    } else {
      redirect("/products")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-accent-100 to-accent-50 animate-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-accent-300/60 to-accent-200/40 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-accent-400/50 to-accent-300/30 rounded-full blur-3xl animate-pulse-slow delay-300" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br from-secondary/10 to-accent-300/40 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-gradient-to-tr from-accent-500/40 to-transparent rounded-full blur-2xl animate-float delay-500" />
      </div>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-accent-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-bold text-secondary">E-Store</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-6 py-2 text-secondary font-semibold hover:text-accent-700 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent-700 transition font-semibold shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-white to-accent-100 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow delay-200" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full animate-fadeIn">
              <span className="text-secondary font-semibold text-sm">✨ Welcome to the Future of Shopping</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-secondary mb-6 leading-tight animate-fadeIn delay-100">
              Shop Smarter,
              <span className="block bg-gradient-to-r from-secondary to-accent-600 bg-clip-text text-transparent">
                Live Better
              </span>
            </h1>
            <p className="text-xl text-accent-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fadeIn delay-200">
              Discover thousands of premium products at unbeatable prices. Experience seamless shopping with fast delivery and secure payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn delay-300">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200"
              >
                Get Started Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-secondary border-2 border-secondary rounded-xl hover:bg-accent-50 transition-all text-lg font-semibold shadow-lg"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-accent-600 animate-fadeIn delay-400">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>10K+ Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white/80 to-accent-100/60 relative backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(192,192,192,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-accent-600 max-w-2xl mx-auto">
              We provide the best shopping experience with premium features
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-accent-50 to-white rounded-2xl hover:shadow-2xl transition-all duration-300 border border-accent-200 hover:border-secondary animate-fadeIn delay-100">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform animate-float">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Fast Delivery</h3>
              <p className="text-accent-600 leading-relaxed">
                Lightning-fast shipping to your doorstep. Track your orders in real-time with our advanced logistics.
              </p>
            </div>
            <div className="group p-8 bg-gradient-to-br from-accent-50 to-white rounded-2xl hover:shadow-2xl transition-all duration-300 border border-accent-200 hover:border-secondary animate-fadeIn delay-200">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform animate-float delay-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Secure Payment</h3>
              <p className="text-accent-600 leading-relaxed">
                Shop with confidence using our encrypted payment gateway. Your data is always protected.
              </p>
            </div>
            <div className="group p-8 bg-gradient-to-br from-accent-50 to-white rounded-2xl hover:shadow-2xl transition-all duration-300 border border-accent-200 hover:border-secondary animate-fadeIn delay-300">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform animate-float delay-400">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Premium Quality</h3>
              <p className="text-accent-600 leading-relaxed">
                Handpicked products from trusted brands. Quality guaranteed or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <CounterStats />

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-accent-100 via-accent-50 to-accent-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(160,160,160,0.2),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center animate-scaleIn relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-accent-600 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the future of online shopping today!
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transform duration-200"
          >
            Create Free Account
          </Link>
          <p className="mt-6 text-sm text-accent-500">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6" />
                <span className="text-xl font-bold">E-Store</span>
              </div>
              <p className="text-accent-300 text-sm">
                Your trusted partner for online shopping with premium quality products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-accent-300 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-accent-700 pt-8 text-center text-accent-300 text-sm">
            <p>&copy; 2024 E-Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
