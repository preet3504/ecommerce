"use client"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, User, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/products")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Navbar */}
      <nav className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-accent-200 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <LayoutDashboard className="text-secondary" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
                <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/products" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
                <Package size={18} className="group-hover:scale-110 transition-transform" />
                <span>Products</span>
              </Link>
              <Link href="/admin/orders" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
                <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                <span>Orders</span>
              </Link>
              <Link href="/admin/users" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
                <Users size={18} className="group-hover:scale-110 transition-transform" />
                <span>Users</span>
              </Link>
              <Link href="/admin/categories" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group">
                <Tag size={18} className="group-hover:scale-110 transition-transform" />
                <span>Categories</span>
              </Link>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-accent-200 to-white rounded-full flex items-center justify-center">
                    <User size={20} className="text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{session?.user?.name}</p>
                    <p className="text-xs text-accent-200">Admin</p>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-secondary rounded-xl shadow-2xl py-2 z-50 border border-accent-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-accent-100">
                      <p className="font-semibold">{session?.user?.name}</p>
                      <p className="text-xs text-accent-600">{session?.user?.email}</p>
                      <p className="text-xs text-accent-600 mt-1">
                        <span className="px-2 py-0.5 bg-secondary text-white rounded-full text-[10px]">ADMIN</span>
                      </p>
                    </div>
                    <Link
                      href="/products"
                      className="block px-4 py-3 hover:bg-accent-50 transition flex items-center gap-3"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Package size={18} />
                      <span>View Store</span>
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition flex items-center gap-3 text-red-600 border-t border-accent-100 mt-2"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-white/10 animate-slideDown">
              <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/products" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                <Package size={18} />
                <span>Products</span>
              </Link>
              <Link href="/admin/orders" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                <ShoppingBag size={18} />
                <span>Orders</span>
              </Link>
              <Link href="/admin/users" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                <Users size={18} />
                <span>Users</span>
              </Link>
              <Link href="/admin/categories" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                <Tag size={18} />
                <span>Categories</span>
              </Link>
              <div className="border-t border-white/10 mt-2 pt-2">
                <Link href="/products" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3">
                  <Package size={18} />
                  <span>View Store</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition flex items-center gap-3 text-red-300"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {children}
    </div>
  )
}
