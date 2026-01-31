"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle, Clock, DollarSign, Phone } from "lucide-react"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${params.id}`)
      setOrder(data)
    } catch (error) {
      console.error("Failed to fetch order:", error)
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
            <h1 className="text-5xl font-bold">Order Details</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-accent-200 rounded-2xl"></div>
            <div className="h-96 bg-accent-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-accent-400" />
          </div>
          <h2 className="text-3xl font-bold text-secondary mb-4">Order not found</h2>
          <p className="text-accent-600 mb-8">The order you're looking for doesn't exist</p>
          <Link
            href="/orders"
            className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const shippingAddr = JSON.parse(order.shippingAddress)

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Package size={32} className="text-accent-200" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              Order Details
            </h1>
          </div>
          <p className="text-accent-200 text-lg">{order.orderNumber}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-secondary hover:text-accent-700 transition-colors font-semibold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-accent-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-secondary mb-2">{order.orderNumber}</h2>
                  <div className="flex items-center gap-2 text-accent-600">
                    <Clock size={16} />
                    <p className="text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl font-bold border-2 ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-accent-200">
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <Package size={24} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-accent-200 last:border-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-secondary mb-1 line-clamp-2">{item.product.name}</h3>
                      <p className="text-sm text-accent-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-accent-600">Price: ${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-accent-200">
              <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                <Truck size={24} />
                Order Tracking
              </h2>
              <div className="relative">
                {order.tracking.map((track, index) => (
                  <div key={track.id} className="flex gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 
                          ? 'bg-secondary text-white' 
                          : 'bg-accent-200 text-accent-600'
                      }`}>
                        {index === 0 ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      {index !== order.tracking.length - 1 && (
                        <div className="w-0.5 flex-1 bg-accent-300 my-2 min-h-[40px]"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className="font-bold text-lg text-secondary mb-1">{track.status}</h3>
                      <p className="text-accent-700 mb-2">{track.message}</p>
                      {track.location && (
                        <div className="flex items-center gap-1 text-sm text-accent-600 mb-1">
                          <MapPin size={14} />
                          <span>{track.location}</span>
                        </div>
                      )}
                      <p className="text-xs text-accent-500">
                        {new Date(track.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-accent-200">
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                <DollarSign size={24} />
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-accent-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-accent-700">
                  <span className="flex items-center gap-1">
                    <Truck size={16} />
                    Shipping
                  </span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-accent-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-secondary">Total</span>
                    <span className="text-3xl font-bold text-secondary">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-accent-200">
                <div>
                  <p className="text-sm text-accent-600 mb-1 flex items-center gap-1">
                    <CreditCard size={14} />
                    Payment Method
                  </p>
                  <p className="font-bold text-secondary capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-accent-600 mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    order.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-accent-200">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                <MapPin size={24} />
                Shipping Address
              </h2>
              <div className="space-y-2 text-accent-700">
                <p className="font-bold text-secondary text-lg">{shippingAddr.name}</p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-accent-500" />
                  {shippingAddr.phone}
                </p>
                <p className="text-sm leading-relaxed">{shippingAddr.address}</p>
                <p className="text-sm">
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
