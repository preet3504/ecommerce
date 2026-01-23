# Step-by-Step Implementation Guide - Part 4

## STEP 9: Order Tracking (30 minutes)

### 9.1 Create Order Detail Page with Tracking

Create `src/app/(user)/orders/[id]/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"

export default function OrderDetailPage() {
  const params = useParams()
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
    return <div className="min-h-screen flex items-center justify-center">Loading order...</div>
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>
  }

  const shippingAddr = order.shippingAddress

  return (
    <div className="min-h-screen bg-white">
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
        <Link href="/orders" className="text-secondary hover:underline mb-4 inline-block">
          ← Back to Orders
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-accent-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-secondary mb-2">{order.orderNumber}</h1>
                  <p className="text-accent-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-accent-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-secondary mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-accent-200 last:border-0">
                    <img
                      src={Array.isArray(item.product.images) ? item.product.images[0] : 'https://via.placeholder.com/100'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary">{item.product.name}</h3>
                      <p className="text-sm text-accent-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-accent-600">Price: ${item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-accent-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-secondary mb-6">Order Tracking</h2>
              <div className="relative">
                {order.tracking.map((track, index) => (
                  <div key={track.id} className="flex gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-secondary' : 'bg-accent-300'}`}></div>
                      {index !== order.tracking.length - 1 && (
                        <div className="w-0.5 h-full bg-accent-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className="font-semibold text-secondary">{track.status}</h3>
                      <p className="text-sm text-accent-600">{track.message}</p>
                      {track.location && (
                        <p className="text-sm text-accent-500">📍 {track.location}</p>
                      )}
                      <p className="text-xs text-accent-500 mt-1">
                        {new Date(track.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-accent-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-accent-300 pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-accent-600">Payment Method:</p>
                <p className="font-semibold text-secondary capitalize">{order.paymentMethod}</p>
              </div>
              <div className="text-sm mt-3">
                <p className="text-accent-600">Payment Status:</p>
                <p className="font-semibold text-secondary">{order.paymentStatus}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-accent-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-secondary mb-4">Shipping Address</h2>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{shippingAddr.name}</p>
                <p className="text-accent-700">{shippingAddr.phone}</p>
                <p className="text-accent-700">{shippingAddr.address}</p>
                <p className="text-accent-700">
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
```

### ✅ Test Order Tracking

1. Place an order
2. Click on order from orders list
3. See order details and tracking timeline

---

## STEP 10: Admin Dashboard (2 hours)

### 10.1 Create Admin Layout

Create `src/app/(admin)/admin/layout.jsx`:

```javascript
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/products")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Navbar */}
      <nav className="bg-secondary text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-2xl font-bold">
            Admin Panel
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/admin/dashboard" className="hover:text-accent-200">Dashboard</Link>
            <Link href="/admin/products" className="hover:text-accent-200">Products</Link>
            <Link href="/admin/orders" className="hover:text-accent-200">Orders</Link>
            <Link href="/admin/users" className="hover:text-accent-200">Users</Link>
            <Link href="/admin/categories" className="hover:text-accent-200">Categories</Link>
            <Link href="/admin/offers" className="hover:text-accent-200">Offers</Link>
            <div className="text-sm">{session.user.name}</div>
          </div>
        </div>
      </nav>

      {children}
    </div>
  )
}
```

### 10.2 Create Admin Dashboard

Create `src/app/(admin)/admin/dashboard/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"

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
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get("/api/orders"),
        axios.get("/api/products"),
        axios.get("/api/users")
      ])

      const orders = ordersRes.data
      const totalRevenue = orders
        .filter(o => o.paymentStatus === "PAID")
        .reduce((sum, o) => sum + o.totalAmount, 0)

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: productsRes.data.products.length,
        totalUsers: usersRes.data.length,
        recentOrders: orders.slice(0, 5)
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-secondary mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
          <h3 className="text-accent-600 text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-secondary">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
          <h3 className="text-accent-600 text-sm mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
          <h3 className="text-accent-600 text-sm mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalProducts}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow">
          <h3 className="text-accent-600 text-sm mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalUsers}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-accent-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent-300">
                <th className="text-left py-3 px-4">Order Number</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-accent-200">
                  <td className="py-3 px-4 font-semibold">{order.orderNumber}</td>
                  <td className="py-3 px-4">{order.user.name}</td>
                  <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-accent-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

### 10.3 Create Users API

Create `src/app/api/users/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
```

### 10.4 Create User Update API

Create `src/app/api/users/[id]/route.js`:

```javascript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
```

### 10.5 Create Admin Products Page

Create `src/app/(admin)/admin/products/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast"

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products")
      setProducts(data.products)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await axios.delete(`/api/products/${id}`)
      toast.success("Product deleted")
      fetchProducts()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  if (loading) {
    return <div className="p-8">Loading products...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">Products Management</h1>
        <Link
          href="/admin/products/create"
          className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent-700 transition"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-accent-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="text-left py-4 px-6">Image</th>
              <th className="text-left py-4 px-6">Name</th>
              <th className="text-left py-4 px-6">Category</th>
              <th className="text-left py-4 px-6">Price</th>
              <th className="text-left py-4 px-6">Stock</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-accent-200">
                <td className="py-4 px-6">
                  <img
                    src={Array.isArray(product.images) ? product.images[0] : 'https://via.placeholder.com/50'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-4 px-6 font-semibold">{product.name}</td>
                <td className="py-4 px-6">{product.category.name}</td>
                <td className="py-4 px-6">${product.price}</td>
                <td className="py-4 px-6">{product.stock}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 10.6 Create Admin Orders Page

Create `src/app/(admin)/admin/orders/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AdminOrdersPage() {
  const router = useRouter()
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
    return <div className="p-8">Loading orders...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-secondary mb-8">Orders Management</h1>

      <div className="bg-accent-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="text-left py-4 px-6">Order Number</th>
              <th className="text-left py-4 px-6">Customer</th>
              <th className="text-left py-4 px-6">Amount</th>
              <th className="text-left py-4 px-6">Status</th>
              <th className="text-left py-4 px-6">Payment</th>
              <th className="text-left py-4 px-6">Date</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-accent-200">
                <td className="py-4 px-6 font-semibold">{order.orderNumber}</td>
                <td className="py-4 px-6">{order.user.name}</td>
                <td className="py-4 px-6">${order.totalAmount.toFixed(2)}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6">{order.paymentStatus}</td>
                <td className="py-4 px-6 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="px-3 py-1 bg-secondary text-white rounded hover:bg-accent-700 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 10.7 Create Admin Users Page

Create `src/app/(admin)/admin/users/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/users")
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole })
      toast.success("User role updated")
      fetchUsers()
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  if (loading) {
    return <div className="p-8">Loading users...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <h1 className="text-4xl font-bold text-secondary mb-8">Users Management</h1>

      <div className="bg-accent-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="text-left py-4 px-6">Name</th>
              <th className="text-left py-4 px-6">Email</th>
              <th className="text-left py-4 px-6">Role</th>
              <th className="text-left py-4 px-6">Orders</th>
              <th className="text-left py-4 px-6">Joined</th>
              <th className="text-left py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-accent-200">
                <td className="py-4 px-6 font-semibold">{user.name}</td>
                <td className="py-4 px-6">{user.email}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6">{user._count.orders}</td>
                <td className="py-4 px-6 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="px-3 py-1 border border-accent-300 rounded text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### ✅ Test Admin Features

1. Login as admin: `admin@example.com / admin123`
2. Visit `/admin/dashboard` - See stats
3. Visit `/admin/products` - Manage products
4. Visit `/admin/orders` - View all orders
5. Visit `/admin/users` - Change user roles

---

**Continue to STEP_BY_STEP_IMPLEMENTATION_PART5.md for Categories, Offers, and Product Forms...**
