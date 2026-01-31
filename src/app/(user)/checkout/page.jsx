"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { CreditCard, Truck, MapPin, Phone, User, CheckCircle, ArrowLeft } from "lucide-react"
import useCartStore from "@/store/cartStore"

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { refreshCartCount } = useCartStore()
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cod"
  })

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("/api/cart")
      if (data.length === 0) {
        toast.error("Cart is empty")
        router.push("/cart")
        return
      }
      setCartItems(data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast.error("Failed to load cart")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateShipping = () => {
    return calculateSubtotal() > 50 ? 0 : 5.99
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // toast.error("Please fix the errors in the form")
      return
    }

    setSubmitting(true)

    try {
      const { data } = await axios.post("/api/orders", {
        shippingAddress: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }),
        paymentMethod: formData.paymentMethod,
        stripePaymentId: null
      })

      await refreshCartCount()
      toast.success("Order placed successfully!", {
        icon: "🎉",
        style: { borderRadius: "12px", background: "#252525", color: "#fff" }
      })
      router.push(`/orders/${data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to place order")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-5xl font-bold">Checkout</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-accent-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={32} className="text-accent-200" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              Checkout
            </h1>
          </div>
          <p className="text-accent-200 text-lg">Complete your order</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-secondary hover:text-accent-700 transition-colors font-semibold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-accent-200">
              <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
                <MapPin size={28} />
                Shipping Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-secondary font-semibold mb-2 flex items-center gap-2">
                    <User size={18} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value})
                      if (errors.name) setErrors({...errors, name: ""})
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                      errors.name ? "border-red-500" : "border-accent-200 focus:border-secondary"
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-secondary font-semibold mb-2 flex items-center gap-2">
                    <Phone size={18} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value})
                      if (errors.phone) setErrors({...errors, phone: ""})
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                      errors.phone ? "border-red-500" : "border-accent-200 focus:border-secondary"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-secondary font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={18} />
                    Street Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({...formData, address: e.target.value})
                      if (errors.address) setErrors({...errors, address: ""})
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                      errors.address ? "border-red-500" : "border-accent-200 focus:border-secondary"
                    }`}
                    rows="3"
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({...formData, city: e.target.value})
                        if (errors.city) setErrors({...errors, city: ""})
                      }}
                      className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                        errors.city ? "border-red-500" : "border-accent-200 focus:border-secondary"
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-secondary font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({...formData, state: e.target.value})
                        if (errors.state) setErrors({...errors, state: ""})
                      }}
                      className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                        errors.state ? "border-red-500" : "border-accent-200 focus:border-secondary"
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-secondary font-semibold mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => {
                      setFormData({...formData, zipCode: e.target.value})
                      if (errors.zipCode) setErrors({...errors, zipCode: ""})
                    }}
                    className={`w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all ${
                      errors.zipCode ? "border-red-500" : "border-accent-200 focus:border-secondary"
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>

                <div className="border-t border-accent-200 pt-6">
                  <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                    <CreditCard size={24} />
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-accent-200 rounded-xl cursor-pointer hover:border-secondary transition-all">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-secondary">Cash on Delivery</p>
                        <p className="text-sm text-accent-600">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-accent-200 rounded-xl cursor-pointer hover:border-secondary transition-all opacity-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        disabled
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-secondary">Credit/Debit Card</p>
                        <p className="text-sm text-accent-600">Coming soon</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-secondary text-white py-4 rounded-xl hover:bg-accent-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-accent-200 p-6">
              <h2 className="text-2xl font-bold text-secondary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-accent-200">
                    <img
                      src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/80'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-secondary text-sm line-clamp-2">{item.product.name}</h4>
                      <p className="text-xs text-accent-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-secondary">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-accent-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-accent-700">
                  <span className="flex items-center gap-2">
                    <Truck size={16} />
                    Shipping
                  </span>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${calculateShipping().toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-accent-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-secondary">Total</span>
                    <span className="text-3xl font-bold text-secondary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-accent-50 p-4 rounded-xl space-y-2 text-sm text-accent-700">
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Secure checkout
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Free returns within 30 days
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  24/7 customer support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
