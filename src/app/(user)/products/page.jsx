"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Search, Filter, Grid, List, TrendingUp, Star, X } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
    setProducts([])
    setHasMore(true)
    fetchProducts(1, true)
  }, [debouncedSearch, selectedCategory])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [hasMore, loadingMore, loading, page])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories")
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams()
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (selectedCategory) params.append("category", selectedCategory)
      params.append("page", pageNum.toString())
      params.append("limit", "20")
      
      const { data } = await axios.get(`/api/products?${params.toString()}`)
      
      if (reset) {
        setProducts(data.products)
      } else {
        setProducts(prev => [...prev, ...data.products])
      }
      
      setHasMore(data.pagination.page < data.pagination.pages)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProducts(nextPage, false)
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-accent-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-accent-200" size={32} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                Discover Products
              </h1>
            </div>
            <p className="text-accent-200 text-lg">Explore our curated collection of premium products</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton Loader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-accent-100 animate-pulse">
                <div className="w-full h-64 bg-accent-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-accent-200 rounded w-1/3"></div>
                  <div className="h-6 bg-accent-200 rounded w-3/4"></div>
                  <div className="h-8 bg-accent-200 rounded w-1/2"></div>
                  <div className="h-4 bg-accent-200 rounded w-1/4"></div>
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary via-accent-800 to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-accent-200" size={32} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
              Discover Products
            </h1>
          </div>
          <p className="text-accent-200 text-lg">Explore our curated collection of 500+ premium products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-accent-100">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Button Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-accent-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 text-lg"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 flex items-center gap-2 font-semibold"
              >
                <Filter size={20} />
                Filters
                {selectedCategory && (
                  <span className="bg-white text-secondary px-2 py-1 rounded-full text-xs">1</span>
                )}
              </button>

              {/* View Toggle */}
              <div className="flex gap-2 bg-accent-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === "grid" ? "bg-white shadow-md" : "hover:bg-accent-200"
                  }`}
                >
                  <Grid size={20} className={viewMode === "grid" ? "text-secondary" : "text-accent-600"} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === "list" ? "bg-white shadow-md" : "hover:bg-accent-200"
                  }`}
                >
                  <List size={20} className={viewMode === "list" ? "text-secondary" : "text-accent-600"} />
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-accent-200 pt-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-secondary">Filter by Category</h3>
                  {selectedCategory && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      selectedCategory === ""
                        ? "border-secondary bg-secondary text-white"
                        : "border-accent-200 hover:border-accent-400"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                        selectedCategory === category.id
                          ? "border-secondary bg-secondary text-white"
                          : "border-accent-200 hover:border-accent-400"
                      }`}
                    >
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs opacity-75">({category._count.products})</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {selectedCategory && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-accent-600">Active filters:</span>
                <span className="px-3 py-1 bg-secondary text-white rounded-full text-sm flex items-center gap-2">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("")} className="hover:text-red-300">
                    <X size={14} />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent-100 hover:border-secondary cursor-pointer transform hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gradient-to-br from-accent-50 to-accent-100">
                  <img
                    src={Array.isArray(product.images) ? product.images[0] : 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Star size={16} fill="white" />
                      Featured
                    </div>
                  )}
                  {product.discountPrice && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      SALE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold mb-3">
                    {product.category.name}
                  </span>

                  {/* Product Name */}
                  <h3 className="font-bold text-lg text-secondary mb-2 line-clamp-2 group-hover:text-accent-700 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-2xl font-bold text-secondary">
                      ${product.price}
                    </p>
                    {product.discountPrice && (
                      <p className="text-lg text-accent-500 line-through">
                        ${product.discountPrice}
                      </p>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 50 
                        ? "bg-green-100 text-green-700" 
                        : product.stock > 0 
                        ? "bg-yellow-100 text-yellow-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                    <button className="text-secondary hover:text-accent-700 transition-colors font-semibold text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">No products found</h3>
            <p className="text-accent-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => setSearch("")}
              className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-accent-700 transition-all duration-300 font-semibold"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && products.length > 0 && (
          <div id="scroll-sentinel" className="py-8 text-center">
            {loadingMore && (
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-accent-600 font-medium">Loading more products...</p>
              </div>
            )}
          </div>
        )}

        {/* End of Results */}
        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <p className="text-accent-600">You've reached the end! 🎉</p>
          </div>
        )}
      </div>
    </div>
  )
}
