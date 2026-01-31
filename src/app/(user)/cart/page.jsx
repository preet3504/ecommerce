"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard } from "lucide-react"
import useCartStore from "@/store/cartStore"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { refreshCartCount } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("/api/cart")
      setCartItems(data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast.error("Failed to load cart")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      setUpdating(true)
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity })
      await fetchCart()
      await refreshCartCount()
      toast.success("Cart updated!", {
        style: { borderRadius: "12px", background: "#252525", color: "#fff" }
      })
    } catch (error) {
      toast.error("Failed to update cart")
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (itemId) => {
    try {
      setUpdating(true)
      await axios.delete(`/api/cart/${itemId}`)
      await fetchCart()
      await refreshCartCount()
      toast.success("Item removed!", {
        style: { borderRadius: "12px", background: "#252525", color: "#fff" }
      })
    } catch (error) {
      toast.error("Failed to remove item")
    } finally {
      setUpdating(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 50 ? 0 : 5.99
    return subtotal + shipping
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <ShoppingCart size={32} className="text-accent-200" />
              <h1 className="text-5xl font-bold">Shopping Cart</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-accent-200">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-accent-200 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-accent-200 rounded w-3/4"></div>
                    <div className="h-4 bg-accent-200 rounded w-1/4"></div>
                    <div className="h-8 bg-accent-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
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
            <ShoppingCart size={32} className="text-accent-200" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
          </div>
          <p className="text-accent-200 text-lg">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={64} className="text-accent-400" />
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-4">Your cart is empty</h2>
            <p className="text-accent-600 mb-8">Add some products to get started!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-accent-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <Link href={`/products/${item.product.id}`}>
                        <div className="relative w-32 h-32 bg-gradient-to-br from-accent-100 to-accent-50 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group">
                          <img
                            src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/200'}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-bold text-xl text-secondary mb-2 hover:text-accent-700 transition-colors cursor-pointer line-clamp-2">
                                {item.product.name}
                              </h3>
                            </Link>
                            <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
                              {item.product.category.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Price */}
                          <div>
                            <p className="text-3xl font-bold text-secondary">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-accent-600">
                              ${item.product.price} each
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-accent-50 rounded-xl p-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating}
                              className="w-10 h-10 bg-white hover:bg-accent-100 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-xl font-bold text-secondary min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock || updating}
                              className="w-10 h-10 bg-white hover:bg-accent-100 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.quantity >= item.product.stock && (
                          <p className="text-sm text-orange-600 mt-2">
                            Maximum stock reached ({item.product.stock} available)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-accent-200 p-6">
                <h2 className="text-2xl font-bold text-secondary mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-accent-700">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-accent-700">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {calculateSubtotal() > 50 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        "$5.99"
                      )}
                    </span>
                  </div>
                  {calculateSubtotal() <= 50 && (
                    <p className="text-sm text-accent-600 bg-accent-50 p-3 rounded-lg">
                      💡 Add ${(50 - calculateSubtotal()).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-accent-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-secondary">Total</span>
                      <span className="text-3xl font-bold text-secondary">
                        ${calculateTotal()?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-secondary text-white py-4 rounded-xl hover:bg-accent-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-2 mb-4"
                >
                  <CreditCard size={24} />
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>

                <Link
                  href="/products"
                  className="block w-full text-center py-3 text-secondary hover:text-accent-700 transition-colors font-semibold"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-accent-200 space-y-3 text-sm text-accent-600">
                  <p>✓ Secure checkout</p>
                  <p>✓ Free returns within 30 days</p>
                  <p>✓ 24/7 customer support</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
