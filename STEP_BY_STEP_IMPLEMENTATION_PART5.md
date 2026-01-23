# Step-by-Step Implementation Guide - Part 5 (Final)

## STEP 11: Categories Management (30 minutes)

### 11.1 Create Categories API

Create `src/app/api/categories/route.js`:

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

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, image } = await request.json()
    const slug = name.toLowerCase().replace(/\s+/g, "-")

    const category = await prisma.category.create({
      data: { name, slug, description, image }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
```

### 11.2 Create Category Update/Delete API

Create `src/app/api/categories/[id]/route.js`:

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

    const body = await request.json()
    const category = await prisma.category.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Category deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
```

### 11.3 Create Categories Page

Create `src/app/(admin)/admin/categories/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories")
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/categories/${editingId}`, formData)
        toast.success("Category updated")
      } else {
        await axios.post("/api/categories", formData)
        toast.success("Category created")
      }
      setShowModal(false)
      setFormData({ name: "", description: "" })
      setEditingId(null)
      fetchCategories()
    } catch (error) {
      toast.error("Failed to save category")
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return
    try {
      await axios.delete(`/api/categories/${id}`)
      toast.success("Category deleted")
      fetchCategories()
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  const openEdit = (category) => {
    setFormData({ name: category.name, description: category.description || "" })
    setEditingId(category.id)
    setShowModal(true)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">Categories</h1>
        <button
          onClick={() => {
            setFormData({ name: "", description: "" })
            setEditingId(null)
            setShowModal(true)
          }}
          className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent-700"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-accent-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-secondary mb-2">{category.name}</h3>
            <p className="text-accent-600 text-sm mb-4">{category.description}</p>
            <p className="text-sm text-accent-500 mb-4">{category._count.products} products</p>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(category)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-secondary mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-accent-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-secondary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-accent-300 rounded"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-secondary text-white py-3 rounded hover:bg-accent-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-accent-300 text-secondary py-3 rounded hover:bg-accent-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## STEP 12: Product Create/Edit Forms (45 minutes)

### 12.1 Create Product Form

Create `src/app/(admin)/admin/products/create/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    images: ["https://via.placeholder.com/400"]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories")
      setCategories(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }))
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post("/api/products", formData)
      toast.success("Product created successfully!")
      router.push("/admin/products")
    } catch (error) {
      toast.error("Failed to create product")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <h1 className="text-4xl font-bold text-secondary mb-8">Create Product</h1>

      <form onSubmit={handleSubmit} className="bg-accent-50 p-8 rounded-lg space-y-6">
        <div>
          <label className="block text-secondary mb-2 font-semibold">Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-secondary mb-2 font-semibold">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-secondary mb-2 font-semibold">Price *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-secondary mb-2 font-semibold">Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-secondary mb-2 font-semibold">Category *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-secondary text-white py-3 rounded-lg hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 bg-accent-300 text-secondary py-3 rounded-lg hover:bg-accent-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 12.2 Create Edit Product Form

Create `src/app/(admin)/admin/products/edit/[id]/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories")
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${params.id}`)
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        stock: data.stock.toString(),
        categoryId: data.categoryId
      })
    } catch (error) {
      console.error("Failed to fetch product:", error)
      toast.error("Product not found")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.put(`/api/products/${params.id}`, formData)
      toast.success("Product updated successfully!")
      router.push("/admin/products")
    } catch (error) {
      toast.error("Failed to update product")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <h1 className="text-4xl font-bold text-secondary mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-accent-50 p-8 rounded-lg space-y-6">
        <div>
          <label className="block text-secondary mb-2 font-semibold">Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-secondary mb-2 font-semibold">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-secondary mb-2 font-semibold">Price *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-secondary mb-2 font-semibold">Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-secondary mb-2 font-semibold">Category *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="w-full p-3 border border-accent-300 rounded"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-secondary text-white py-3 rounded-lg hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 bg-accent-300 text-secondary py-3 rounded-lg hover:bg-accent-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## STEP 13: Admin Order Detail (30 minutes)

### 13.1 Create Admin Order Detail Page

Create `src/app/(admin)/admin/orders/[id]/page.jsx`:

```javascript
"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    trackingMessage: "",
    trackingLocation: ""
  })

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${params.id}`)
      setOrder(data)
      setStatusUpdate({ ...statusUpdate, status: data.status })
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/orders/${params.id}`, statusUpdate)
      toast.success("Order status updated")
      fetchOrder()
      setStatusUpdate({ ...statusUpdate, trackingMessage: "", trackingLocation: "" })
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!order) return <div className="p-8">Order not found</div>

  const shippingAddr = order.shippingAddress

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Toaster position="top-right" />
      
      <h1 className="text-4xl font-bold text-secondary mb-8">Order Details</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-accent-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-secondary mb-4">{order.orderNumber}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-accent-600">Customer:</p>
                <p className="font-semibold">{order.user.name}</p>
                <p className="text-accent-600">{order.user.email}</p>
              </div>
              <div>
                <p className="text-accent-600">Order Date:</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-accent-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-3 border-b border-accent-200">
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-accent-600">Qty: {item.quantity} × ${item.price}</p>
                  </div>
                  <p className="font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Update Status Form */}
          <div className="bg-accent-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Update Order Status</h2>
            <form onSubmit={updateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-secondary mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                  className="w-full p-3 border border-accent-300 rounded"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-secondary mb-2">Tracking Message</label>
                <input
                  type="text"
                  value={statusUpdate.trackingMessage}
                  onChange={(e) => setStatusUpdate({...statusUpdate, trackingMessage: e.target.value})}
                  className="w-full p-3 border border-accent-300 rounded"
                  placeholder="e.g., Package shipped from warehouse"
                />
              </div>
              <div>
                <label className="block text-secondary mb-2">Location</label>
                <input
                  type="text"
                  value={statusUpdate.trackingLocation}
                  onChange={(e) => setStatusUpdate({...statusUpdate, trackingLocation: e.target.value})}
                  className="w-full p-3 border border-accent-300 rounded"
                  placeholder="e.g., New York Distribution Center"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-secondary text-white py-3 rounded hover:bg-accent-700"
              >
                Update Status
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-accent-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Shipping Address</h2>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{shippingAddr.name}</p>
              <p>{shippingAddr.phone}</p>
              <p>{shippingAddr.address}</p>
              <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## STEP 14: Final Touches & Testing (30 minutes)

### 14.1 Update package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### 14.2 Create .env.example

Create `.env.example`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 14.3 Create README

Create `README.md`:

```markdown
# E-Commerce Platform

Modern e-commerce platform built with Next.js 14, Prisma, and MySQL.

## Features

- Role-based authentication (User/Admin)
- Product catalog with search
- Shopping cart & wishlist
- Order management & tracking
- Admin dashboard
- Categories & offers management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
npx prisma migrate dev
npx prisma db seed
```

3. Run development server:
```bash
npm run dev
```

## Test Credentials

**Admin:** admin@example.com / admin123
**User:** user@example.com / user123

## Tech Stack

- Next.js 14
- Prisma ORM
- MySQL
- NextAuth.js
- Tailwind CSS
- Zustand
```

---

## Complete Testing Checklist

### Authentication ✅
- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Session persists on refresh
- [ ] Logout works
- [ ] Protected routes redirect

### User Features ✅
- [ ] Browse products
- [ ] Search products
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Add to wishlist
- [ ] Move wishlist to cart
- [ ] Checkout process
- [ ] Place order
- [ ] View orders
- [ ] Track order status

### Admin Features ✅
- [ ] View dashboard stats
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] View all orders
- [ ] Update order status
- [ ] Add tracking info
- [ ] View users
- [ ] Change user roles
- [ ] Create categories
- [ ] Edit categories
- [ ] Delete categories

---

## Deployment Guide

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Options

- **PlanetScale** (Recommended)
- **Railway**
- **AWS RDS**
- **DigitalOcean**

---

## 🎉 Congratulations!

You've built a complete e-commerce platform with:

- ✅ 50+ files created
- ✅ 30+ API endpoints
- ✅ 20+ pages
- ✅ Full authentication system
- ✅ Role-based access control
- ✅ Complete shopping flow
- ✅ Admin dashboard
- ✅ Order tracking
- ✅ Modern UI with Tailwind

**Total Implementation Time: 10-12 hours**

---

## Next Steps

1. Add Stripe payment integration
2. Implement image upload (Uploadthing)
3. Add email notifications
4. Create product reviews
5. Add advanced filters
6. Implement caching
7. Add analytics
8. Write tests
9. Optimize performance
10. Deploy to production

**Happy Coding! 🚀**
