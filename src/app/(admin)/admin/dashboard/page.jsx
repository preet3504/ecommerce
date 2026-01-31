"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Calendar, Eye } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/stats")
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      CONFIRMED: "bg-blue-100 text-blue-700 border-blue-300",
      PROCESSING: "bg-purple-100 text-purple-700 border-purple-300",
      SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-300",
      DELIVERED: "bg-green-100 text-green-700 border-green-300",
      CANCELLED: "bg-red-100 text-red-700 border-red-300"
    }
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-5xl font-bold">Dashboard</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-accent-200 animate-pulse">
                <div className="h-4 bg-accent-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-accent-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={32} className="text-accent-200" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-accent-200 text-lg">Welcome back! Here's your store overview</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-green-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign size={28} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                  Revenue
                </span>
              </div>
              <h3 className="text-accent-600 text-sm font-semibold mb-2">Total Revenue</h3>
              <p className="text-4xl font-bold text-secondary">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Orders Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-blue-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag size={28} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-3 py-1 rounded-full">
                  Orders
                </span>
              </div>
              <h3 className="text-accent-600 text-sm font-semibold mb-2">Total Orders</h3>
              <p className="text-4xl font-bold text-secondary">{stats.totalOrders}</p>
            </div>
          </div>

          {/* Products Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-purple-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package size={28} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-3 py-1 rounded-full">
                  Products
                </span>
              </div>
              <h3 className="text-accent-600 text-sm font-semibold mb-2">Total Products</h3>
              <p className="text-4xl font-bold text-secondary">{stats.totalProducts}</p>
            </div>
          </div>

          {/* Users Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-orange-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users size={28} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-3 py-1 rounded-full">
                  Users
                </span>
              </div>
              <h3 className="text-accent-600 text-sm font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold text-secondary">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl border border-accent-100 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-50 to-white p-6 border-b border-accent-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-secondary">Recent Orders</h2>
              </div>
              <Link
                href="/admin/orders"
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent-700 transition-all duration-300 font-semibold text-sm flex items-center gap-2"
              >
                View All
                <Eye size={16} />
              </Link>
            </div>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={40} className="text-accent-400" />
              </div>
              <p className="text-accent-600 text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Order Number</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className={`border-b border-accent-100 hover:bg-accent-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-accent-50/30'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className="font-bold text-secondary">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-secondary">{order.user.name}</p>
                          <p className="text-sm text-accent-600">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-secondary">${order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-accent-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-secondary text-white rounded-lg hover:bg-accent-700 transition-all duration-300 text-sm font-semibold"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
