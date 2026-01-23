# Step-by-Step Implementation Guide - Part 3

## STEP 7: Wishlist System (30 minutes)

### 7.1 Create Wishlist API

Create `src/app/api/wishlist/route.js`:

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

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already in wishlist" }, { status: 400 })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId
      },
      include: { product: true }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}
```

### 7.2 Create Wishlist Delete API

Create `src/app/api/wishlist/[id]/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.wishlist.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: "Removed from wishlist" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 })
  }
}
```

### 7.3 Create Wishlist Page

Create `src/app/(user)/wishlist/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist")
      setWishlistItems(data)
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/wishlist/${itemId}`)
      fetchWishlist()
      toast.success("Removed from wishlist")
    } catch (error) {
      toast.error("Failed to remove")
    }
  }

  const moveToCart = async (productId, itemId) => {
    try {
      await axios.post("/api/cart", { productId, quantity: 1 })
      await axios.delete(`/api/wishlist/${itemId}`)
      fetchWishlist()
      toast.success("Moved to cart!")
    } catch (error) {
      toast.error("Failed to move to cart")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">E-Store</Link>
          <div className="flex gap-6">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist" className="font-bold">Wishlist</Link>
            <Link href="/orders">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-secondary mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-accent-600 mb-4">Your wishlist is empty</p>
            <Link href="/products" className="text-secondary hover:underline">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white border border-accent-200 rounded-lg shadow-sm">
                <img
                  src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/400'}
                  alt={item.product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-secondary mb-2">{item.product.name}</h3>
                  <p className="text-accent-600 text-sm mb-2">{item.product.category.name}</p>
                  <p className="text-lg font-bold text-secondary mb-4">${item.product.price}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCart(item.product.id, item.id)}
                      className="flex-1 bg-secondary text-white py-2 rounded hover:bg-accent-700 transition text-sm"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 transition text-sm"
                    >
                      Remove
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
```

### ✅ Test Wishlist

1. Go to product detail page
2. Click "Add to Wishlist"
3. Visit `/wishlist`
4. Move items to cart
5. Remove items

---

## STEP 8: Checkout & Orders System (1.5 hours)

### 8.1 Create Orders API

Create `src/app/api/orders/route.js`:

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

    const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shippingAddress, paymentMethod, stripePaymentId } = await request.json()

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Check stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        )
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "card" ? "PAID" : "PENDING",
        stripePaymentId,
        status: "PENDING",
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        },
        tracking: {
          create: {
            status: "Order Placed",
            message: "Your order has been placed successfully",
            location: "Processing Center"
          }
        }
      },
      include: {
        items: { include: { product: true } },
        tracking: true
      }
    })

    // Update stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
```

### 8.2 Create Order Detail API

Create `src/app/api/orders/[id]/route.js`:

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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: true }
        },
        tracking: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, trackingMessage, trackingLocation } = await request.json()

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        items: { include: { product: true } },
        tracking: true
      }
    })

    if (trackingMessage) {
      await prisma.orderTracking.create({
        data: {
          orderId: params.id,
          status,
          message: trackingMessage,
          location: trackingLocation || ""
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
```

### 8.3 Create Checkout Page

Create `src/app/(user)/checkout/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
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
      }
      setCartItems(data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post("/api/orders", {
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        stripePaymentId: null
      })

      toast.success("Order placed successfully!")
      router.push(`/orders/${data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to place order")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">E-Store</Link>
          <div className="flex gap-6">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/orders">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-secondary mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-accent-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-secondary mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-secondary mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-2">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full p-3 border border-accent-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-secondary mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full p-3 border border-accent-300 rounded"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-secondary mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-2">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full p-3 border border-accent-300 rounded"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-secondary text-white py-3 rounded-lg hover:bg-accent-700 transition disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-accent-50 p-6 rounded-lg h-fit">
            <h2 className="text-2xl font-bold text-secondary mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-accent-300 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 8.4 Create Orders List Page

Create `src/app/(user)/orders/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"

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
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-indigo-100 text-indigo-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700"
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold">E-Store</Link>
          <div className="flex gap-6">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/orders" className="font-bold">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-secondary mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-accent-600 mb-4">No orders yet</p>
            <Link href="/products" className="text-secondary hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-accent-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-secondary text-lg">{order.orderNumber}</h3>
                      <p className="text-sm text-accent-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="text-sm text-accent-700">
                        {item.product.name} x {item.quantity}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-accent-600">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-secondary">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-secondary hover:underline">View Details →</span>
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
```

### ✅ Test Orders

1. Add items to cart
2. Go to `/checkout`
3. Fill shipping form
4. Place order
5. View order in `/orders`

---

**Continue to STEP_BY_STEP_IMPLEMENTATION_PART4.md for Order Tracking and Admin features...**
