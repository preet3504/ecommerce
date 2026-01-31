"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"
import { ArrowLeft, ShoppingCart, Heart, Package, Star, TrendingUp, Shield, Truck } from "lucide-react"
import useCartStore from "@/store/cartStore"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const { refreshCartCount, refreshWishlistCount } = useCartStore()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${params.id}`)
      setProduct(data)
    } catch (error) {
      console.error("Failed to fetch product:", error)
      toast.error("Product not found")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    try {
      setAddingToCart(true)
      await axios.post("/api/cart", {
        productId: product.id,
        quantity
      })
      await refreshCartCount()
      toast.success("Added to cart!", {
        icon: "🛒",
        style: {
          borderRadius: "12px",
          background: "#252525",
          color: "#fff",
        },
      })
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const addToWishlist = async () => {
    try {
      setAddingToWishlist(true)
      await axios.post("/api/wishlist", {
        productId: product.id
      })
      await refreshWishlistCount()
      toast.success("Added to wishlist!", {
        icon: "❤️",
        style: {
          borderRadius: "12px",
          background: "#252525",
          color: "#fff",
        },
      })
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add to wishlist")
    } finally {
      setAddingToWishlist(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-accent-200 rounded w-32 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-accent-200 rounded-2xl h-[600px]"></div>
              <div className="space-y-6">
                <div className="h-12 bg-accent-200 rounded w-3/4"></div>
                <div className="h-6 bg-accent-200 rounded w-1/4"></div>
                <div className="h-16 bg-accent-200 rounded w-1/2"></div>
                <div className="h-32 bg-accent-200 rounded"></div>
                <div className="h-12 bg-accent-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-accent-400" />
          </div>
          <h2 className="text-3xl font-bold text-secondary mb-4">Product not found</h2>
          <p className="text-accent-600 mb-8">The product you're looking for doesn't exist</p>
          <Link
            href="/products"
            className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-secondary hover:text-accent-700 transition-colors font-semibold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Product Details Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl overflow-hidden shadow-2xl border border-accent-200">
                <img
                  src={Array.isArray(product.images) ? product.images[0] : 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              {product.featured && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Star size={16} fill="white" />
                  Featured Product
                </div>
              )}
              {product.discountPrice && (
                <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  SALE
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold">
                {product.category.name}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                product.stock > 50 
                  ? "bg-green-100 text-green-700" 
                  : product.stock > 0 
                  ? "bg-yellow-100 text-yellow-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <p className="text-5xl font-bold text-secondary">
                ${product.price}
              </p>
              {product.discountPrice && (
                <div className="flex flex-col">
                  <p className="text-2xl text-accent-500 line-through">
                    ${product.discountPrice}
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    Save ${(product.discountPrice - product.price).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-accent-200 shadow-lg">
              <h3 className="text-xl font-bold text-secondary mb-3">Product Description</h3>
              <p className="text-accent-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-2xl p-6 border border-accent-200 shadow-lg">
              <label className="text-lg font-bold text-secondary mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-accent-100 hover:bg-accent-200 rounded-xl font-bold text-xl transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 h-12 text-center text-xl font-bold border-2 border-accent-200 rounded-xl focus:outline-none focus:border-secondary"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 bg-accent-100 hover:bg-accent-200 rounded-xl font-bold text-xl transition-colors"
                >
                  +
                </button>
                <span className="text-accent-600 ml-2">
                  Max: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 bg-secondary text-white py-4 rounded-xl hover:bg-accent-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={addToWishlist}
                disabled={addingToWishlist}
                className="px-6 py-4 bg-white border-2 border-secondary text-secondary rounded-xl hover:bg-accent-50 transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addingToWishlist ? (
                  <div className="w-5 h-5 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Heart size={24} />
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-accent-200 text-center shadow-lg">
                <Truck className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-semibold text-secondary">Fast Delivery</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-accent-200 text-center shadow-lg">
                <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-semibold text-secondary">Secure Payment</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-accent-200 text-center shadow-lg">
                <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-semibold text-secondary">Premium Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl p-8 border border-accent-200 shadow-xl">
          <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
            <TrendingUp size={32} />
            Product Details
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-secondary mb-4">Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-accent-200">
                  <span className="text-accent-600">SKU</span>
                  <span className="font-semibold text-secondary">{product.slug}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent-200">
                  <span className="text-accent-600">Category</span>
                  <span className="font-semibold text-secondary">{product.category.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent-200">
                  <span className="text-accent-600">Availability</span>
                  <span className="font-semibold text-secondary">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-accent-600">Featured</span>
                  <span className="font-semibold text-secondary">
                    {product.featured ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary mb-4">Shipping & Returns</h3>
              <div className="space-y-3 text-accent-700">
                <p>✓ Free shipping on orders over $50</p>
                <p>✓ 30-day return policy</p>
                <p>✓ Secure checkout with SSL encryption</p>
                <p>✓ 24/7 customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
