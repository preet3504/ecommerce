# Step-by-Step Implementation Guide - Part 2

## STEP 5: Products System (1 hour)

### 5.1 Create Products API

Create `src/app/api/products/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where = {}
    if (category) where.categoryId = category
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        offers: {
          include: { offer: true },
          where: {
            offer: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" }
    })

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, stock, categoryId, images, discountPrice } = body

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock),
        categoryId,
        images: images || []
      },
      include: { category: true }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
```

### 5.2 Create Product Detail API

Create `src/app/api/products/[id]/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' }
        },
        offers: {
          include: { offer: true },
          where: {
            offer: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price ? parseFloat(body.price) : undefined,
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : undefined,
        stock: body.stock ? parseInt(body.stock) : undefined
      },
      include: { category: true }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Product deletion error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
```

### 5.3 Create Products Page

Create `src/app/(user)/products/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"

export default function ProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [search])

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`/api/products?search=${search}`)
      setProducts(data.products)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-accent-600">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">
            E-Store
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/products" className="hover:text-accent-200">Products</Link>
            <Link href="/cart" className="hover:text-accent-200">Cart</Link>
            <Link href="/wishlist" className="hover:text-accent-200">Wishlist</Link>
            <Link href="/orders" className="hover:text-accent-200">Orders</Link>
            <div className="text-sm">{session?.user?.name}</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-secondary mb-8">Products</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 border border-accent-300 rounded mb-8 focus:outline-none focus:border-secondary"
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-white border border-accent-200 rounded-lg shadow-sm hover:shadow-lg transition cursor-pointer">
                <img
                  src={Array.isArray(product.images) ? product.images[0] : 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-secondary mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-accent-600 text-sm mb-2">{product.category.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-secondary">${product.price}</p>
                    {product.discountPrice && (
                      <p className="text-sm text-accent-500 line-through">${product.discountPrice}</p>
                    )}
                  </div>
                  <p className="text-xs text-accent-500 mt-2">Stock: {product.stock}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-accent-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5.4 Create Product Detail Page

Create `src/app/(user)/products/[id]/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

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
      await axios.post("/api/cart", {
        productId: product.id,
        quantity
      })
      toast.success("Added to cart!")
    } catch (error) {
      toast.error("Failed to add to cart")
    }
  }

  const addToWishlist = async () => {
    try {
      await axios.post("/api/wishlist", {
        productId: product.id
      })
      toast.success("Added to wishlist!")
    } catch (error) {
      toast.error("Failed to add to wishlist")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">E-Store</Link>
          <div className="flex gap-6">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/orders">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <button onClick={() => router.back()} className="mb-4 text-secondary hover:underline">
          ← Back to Products
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={Array.isArray(product.images) ? product.images[0] : 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-secondary mb-4">{product.name}</h1>
            <p className="text-accent-600 mb-4">{product.category.name}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-bold text-secondary">${product.price}</p>
              {product.discountPrice && (
                <p className="text-xl text-accent-500 line-through">${product.discountPrice}</p>
              )}
            </div>

            <p className="text-accent-700 mb-6">{product.description}</p>

            <p className="text-sm text-accent-600 mb-6">
              {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-secondary font-semibold">Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 p-2 border border-accent-300 rounded"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-secondary text-white py-3 rounded-lg hover:bg-accent-700 transition disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={addToWishlist}
                className="px-6 py-3 border-2 border-secondary text-secondary rounded-lg hover:bg-accent-50 transition"
              >
                ❤️ Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-secondary mb-6">Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-accent-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{review.user.name}</p>
                    <p className="text-yellow-500">{'⭐'.repeat(review.rating)}</p>
                  </div>
                  <p className="text-accent-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5.5 Add SessionProvider

Update `src/app/layout.jsx`:

```javascript
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'

export const metadata = {
  title: 'E-Commerce Store',
  description: 'Modern e-commerce platform',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 5.6 Create SessionProvider Component

Create `src/components/SessionProvider.jsx`:

```javascript
"use client"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
```

### ✅ Test Products

1. Login as user: `user@example.com / user123`
2. You should see products list
3. Click on a product to see details
4. Try adding to cart (will implement next)

---

## STEP 6: Cart System (45 minutes)

### 6.1 Create Cart API

Create `src/app/api/cart/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      // Update quantity
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      })
      return NextResponse.json(updated)
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity
      },
      include: { product: true }
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}
```

### 6.2 Create Cart Item Update/Delete API

Create `src/app/api/cart/[id]/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()

    const cartItem = await prisma.cartItem.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: { quantity: parseInt(quantity) },
      include: { product: true }
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.cartItem.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
```

### 6.3 Create Cart Page

Create `src/app/(user)/cart/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("/api/cart")
      setCartItems(data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity })
      fetchCart()
      toast.success("Cart updated")
    } catch (error) {
      toast.error("Failed to update cart")
    }
  }

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`)
      fetchCart()
      toast.success("Item removed")
    } catch (error) {
      toast.error("Failed to remove item")
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">E-Store</Link>
          <div className="flex gap-6">
            <Link href="/products">Products</Link>
            <Link href="/cart" className="font-bold">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/orders">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-secondary mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-accent-600 mb-4">Your cart is empty</p>
            <Link href="/products" className="text-secondary hover:underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-accent-50 p-4 rounded-lg flex gap-4">
                  <img
                    src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/100'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary mb-2">{item.product.name}</h3>
                    <p className="text-accent-600 text-sm mb-2">{item.product.category.name}</p>
                    <p className="text-lg font-bold text-secondary">${item.product.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-accent-200 rounded hover:bg-accent-300"
                      >
                        -
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-accent-200 rounded hover:bg-accent-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-accent-50 p-6 rounded-lg h-fit">
              <h2 className="text-2xl font-bold text-secondary mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-accent-300 pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-accent-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### ✅ Test Cart

1. Go to products page
2. Add items to cart
3. Visit `/cart`
4. Update quantities
5. Remove items

---

**Continue to STEP_BY_STEP_IMPLEMENTATION_PART3.md for Wishlist, Orders, Checkout, and Admin features...**
