"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Package, Calendar, DollarSign, ChevronRight, ShoppingBag } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders")
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
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
            <h1 className="text-5xl font-bold">My Orders</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-accent-200 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-accent-200 rounded w-48"></div>
                    <div className="h-4 bg-accent-200 rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-accent-200 rounded w-24"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-accent-200 rounded w-full"></div>
                  <div className="h-4 bg-accent-200 rounded w-3/4"></div>
                </div>
                <div className="h-8 bg-accent-200 rounded w-32"></div>
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
            <Package size={32} className="text-accent-200" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
          <p className="text-accent-200 text-lg">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={64} className="text-accent-400" />
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-4">No orders yet</h2>
            <p className="text-accent-600 mb-8">Start shopping to place your first order!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <ShoppingBag size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-secondary cursor-pointer">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package size={24} className="text-secondary" />
                          <h3 className="font-bold text-xl text-secondary group-hover:text-accent-700 transition-colors">
                            {order.orderNumber}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-accent-600">
                          <Calendar size={16} />
                          <p className="text-sm">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="bg-accent-50 rounded-xl p-4 mb-6">
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/48'}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-secondary line-clamp-1">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-accent-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-secondary">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-accent-600 text-center pt-2 border-t border-accent-200">
                            +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-secondary" />
                        <span className="text-sm text-accent-600">Total Amount:</span>
                        <span className="text-2xl font-bold text-secondary">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary group-hover:text-accent-700 transition-colors font-semibold">
                        <span>View Details</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
