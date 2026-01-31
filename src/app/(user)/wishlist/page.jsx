"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { Heart, ShoppingCart, Trash2, ShoppingBag, Star } from "lucide-react"
import useCartStore from "@/store/cartStore"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { refreshCartCount, refreshWishlistCount } = useCartStore()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist")
      setWishlistItems(data)
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    try {
      setProcessing(true)
      await axios.delete(`/api/wishlist/${itemId}`)
      await fetchWishlist()
      await refreshWishlistCount()
      toast.success("Removed from wishlist!", {
        style: { borderRadius: "12px", background: "#252525", color: "#fff" }
      })
    } catch (error) {
      toast.error("Failed to remove")
    } finally {
      setProcessing(false)
    }
  }

  const moveToCart = async (productId, itemId) => {
    try {
      setProcessing(true)
      await axios.post("/api/cart", { productId, quantity: 1 })
      await axios.delete(`/api/wishlist/${itemId}`)
      await fetchWishlist()
      await refreshCartCount()
      await refreshWishlistCount()
      toast.success("Moved to cart!", {
        icon: "🛒",
        style: { borderRadius: "12px", background: "#252525", color: "#fff" }
      })
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to move to cart")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <Heart size={32} className="text-accent-200" />
              <h1 className="text-5xl font-bold">My Wishlist</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-accent-100 animate-pulse">
                <div className="w-full h-64 bg-accent-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-accent-200 rounded w-1/3"></div>
                  <div className="h-6 bg-accent-200 rounded w-3/4"></div>
                  <div className="h-8 bg-accent-200 rounded w-1/2"></div>
                  <div className="h-10 bg-accent-200 rounded"></div>
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
            <Heart size={32} className="text-accent-200" fill="currentColor" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </div>
          <p className="text-accent-200 text-lg">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={64} className="text-accent-400" />
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-4">Your wishlist is empty</h2>
            <p className="text-accent-600 mb-8">Save your favorite products for later!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <ShoppingBag size={20} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-secondary">
                {/* Product Image */}
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative overflow-hidden bg-gradient-to-br from-accent-50 to-accent-100 cursor-pointer">
                    <img
                      src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/400'}
                      alt={item.product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.product.featured && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Star size={12} fill="white" />
                        Featured
                      </div>
                    )}
                    {item.product.discountPrice && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        SALE
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeItem(item.id)
                      }}
                      disabled={processing}
                      className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 group/btn"
                      title="Remove from wishlist"
                    >
                      <Heart size={20} className="text-red-500 group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                    </button>
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold mb-3">
                    {item.product.category.name}
                  </span>

                  {/* Product Name */}
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-bold text-lg text-secondary mb-2 line-clamp-2 hover:text-accent-700 transition-colors cursor-pointer">
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-2xl font-bold text-secondary">
                      ${item.product.price}
                    </p>
                    {item.product.discountPrice && (
                      <p className="text-lg text-accent-500 line-through">
                        ${item.product.discountPrice}
                      </p>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.product.stock > 50 
                        ? "bg-green-100 text-green-700" 
                        : item.product.stock > 0 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {item.product.stock > 0 ? `${item.product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCart(item.product.id, item.id)}
                      disabled={item.product.stock === 0 || processing}
                      className="flex-1 bg-secondary text-white py-3 rounded-xl hover:bg-accent-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={processing}
                      className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-300 text-sm font-semibold disabled:opacity-50 flex items-center justify-center"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
