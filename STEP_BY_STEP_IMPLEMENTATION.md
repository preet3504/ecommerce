# Step-by-Step Implementation Guide

## How to Use This Guide

Each section below is a **complete, standalone implementation** that you can do one at a time. Follow the order for best results.

---

## STEP 1: Project Setup (30 minutes)

### 1.1 Create Next.js Project

```bash
npx create-next-app@latest ecommerce-demo
# Select: TypeScript? No, ESLint? Yes, Tailwind? Yes, src/ directory? Yes, App Router? Yes
cd ecommerce-demo
```

### 1.2 Install All Dependencies

```bash
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install bcryptjs
npm install zustand
npm install axios
npm install zod
npm install react-hot-toast
npm install lucide-react
npm install -D @types/bcryptjs
```

### 1.3 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

### 1.4 Setup MySQL Database

**Option A: Local MySQL**
```bash
# Install MySQL locally or use Docker
docker run --name mysql-ecommerce -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=ecommerce_db -p 3306:3306 -d mysql:8
```

**Option B: Cloud Database (Recommended)**
- Use [PlanetScale](https://planetscale.com) (Free tier)
- Use [Railway](https://railway.app) (Free tier)
- Use AWS RDS

### 1.5 Configure Environment Variables

Edit `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
```

Generate secret:
```bash
openssl rand -base64 32
```

### 1.6 Update Prisma Schema

Replace content in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  image     String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  orders    Order[]
  cart      CartItem[]
  wishlist  Wishlist[]
  reviews   Review[]
}

enum Role {
  USER
  ADMIN
}

model Product {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String   @db.Text
  price         Float
  discountPrice Float?
  stock         Int
  images        Json
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  featured      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlist      Wishlist[]
  reviews       Review[]
  offers        ProductOffer[]
  
  @@index([categoryId])
  @@index([slug])
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
  createdAt   DateTime  @default(now())
  
  @@index([slug])
}

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  
  @@unique([userId, productId])
  @@index([userId])
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, productId])
  @@index([userId])
}

model Order {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  orderNumber     String        @unique
  status          OrderStatus   @default(PENDING)
  totalAmount     Float
  shippingAddress Json
  paymentMethod   String
  paymentStatus   PaymentStatus @default(PENDING)
  stripePaymentId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  items           OrderItem[]
  tracking        OrderTracking[]
  
  @@index([userId])
  @@index([orderNumber])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
  
  @@index([orderId])
}

model OrderTracking {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    String
  message   String
  location  String?
  createdAt DateTime @default(now())
  
  @@index([orderId])
}

model Offer {
  id          String   @id @default(cuid())
  title       String
  description String
  discount    Float
  code        String?  @unique
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  products    ProductOffer[]
}

model ProductOffer {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  offerId   String
  offer     Offer   @relation(fields: [offerId], references: [id], onDelete: Cascade)
  
  @@unique([productId, offerId])
  @@index([productId])
  @@index([offerId])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int
  comment   String   @db.Text
  createdAt DateTime @default(now())
  
  @@index([productId])
  @@index([userId])
}
```

### 1.7 Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 1.8 Configure Tailwind

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#252525',
        accent: {
          50: '#f9f9f9',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#252525',
          900: '#1a1a1a',
        }
      }
    }
  },
  plugins: [],
}
```

### 1.9 Update Global Styles

Edit `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-secondary;
  }
}
```

### ✅ Verification

```bash
npm run dev
```

Visit `http://localhost:3000` - You should see the default Next.js page.

---

## STEP 2: Authentication System (1 hour)

### 2.1 Create Prisma Client

Create `src/lib/prisma.js`:

```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

### 2.2 Create Auth Configuration

Create `src/lib/auth.js`:

```javascript
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

### 2.3 Create NextAuth API Route

Create `src/app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 2.4 Create Signup API

Create `src/app/api/auth/signup/route.js`:

```javascript
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER"
      }
    })

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
```

### 2.5 Create Middleware for Route Protection

Create `src/middleware.js`:

```javascript
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/products/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/admin/:path*"
  ]
}
```

### 2.6 Create Login Page

Create folder structure: `src/app/(auth)/login/`

Create `src/app/(auth)/login/page.jsx`:

```javascript
"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false
    })

    if (result?.error) {
      setError("Invalid credentials")
      setLoading(false)
    } else {
      router.push("/products")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8 bg-accent-50 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Login</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-secondary mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-secondary mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded hover:bg-accent-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-accent-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-secondary font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 2.7 Create Signup Page

Create `src/app/(auth)/signup/page.jsx`:

```javascript
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await axios.post("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      router.push("/login?registered=true")
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-8 bg-accent-50 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">Sign Up</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-secondary mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-secondary mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-secondary mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-secondary mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full p-3 border border-accent-300 rounded focus:outline-none focus:border-secondary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded hover:bg-accent-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-accent-600">
          Already have an account?{" "}
          <Link href="/login" className="text-secondary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### ✅ Test Authentication

1. Start server: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Create an account
4. Login at `http://localhost:3000/login`
5. You should be redirected to `/products` (will show 404 for now)

---

## STEP 3: Landing Page (30 minutes)

### 3.1 Create Landing Page

Replace `src/app/page.jsx`:

```javascript
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard")
    } else {
      redirect("/products")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-white to-accent-100">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-secondary mb-6">
            Welcome to Our Store
          </h1>
          <p className="text-xl text-accent-600 mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop now and enjoy a seamless shopping experience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-secondary text-white rounded-lg hover:bg-accent-700 transition text-lg font-semibold"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-secondary border-2 border-secondary rounded-lg hover:bg-accent-50 transition text-lg font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-secondary text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Fast Delivery</h3>
              <p className="text-accent-600">Get your orders delivered quickly and safely to your doorstep.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Secure Payment</h3>
              <p className="text-accent-600">Shop with confidence using our secure payment gateway.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Quality Products</h3>
              <p className="text-accent-600">We offer only the best quality products for our customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-accent-600 mb-8">
            Join thousands of satisfied customers today!
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-secondary text-white rounded-lg hover:bg-accent-700 transition text-lg font-semibold"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 E-Commerce Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
```

### ✅ Test Landing Page

1. Logout if logged in
2. Visit `http://localhost:3000`
3. You should see the landing page with Login/Signup buttons

---

## STEP 4: Seed Database with Sample Data (15 minutes)

### 4.1 Create Seed Script

Create `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER'
    }
  })

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets'
    }
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel'
    }
  })

  const books = await prisma.category.create({
    data: {
      name: 'Books',
      slug: 'books',
      description: 'Books and literature'
    }
  })

  // Create products
  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        stock: 50,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        categoryId: electronics.id,
        featured: true
      },
      {
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Feature-rich smartwatch with fitness tracking',
        price: 199.99,
        stock: 30,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        categoryId: electronics.id,
        featured: true
      },
      {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: 'Comfortable cotton t-shirt in various colors',
        price: 19.99,
        stock: 100,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        categoryId: clothing.id
      },
      {
        name: 'Denim Jeans',
        slug: 'denim-jeans',
        description: 'Classic denim jeans with perfect fit',
        price: 49.99,
        stock: 75,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        categoryId: clothing.id
      },
      {
        name: 'JavaScript Guide',
        slug: 'javascript-guide',
        description: 'Complete guide to modern JavaScript',
        price: 29.99,
        stock: 40,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        categoryId: books.id
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('Admin: admin@example.com / admin123')
  console.log('User: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 4.2 Update package.json

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### 4.3 Run Seed

```bash
npx prisma db seed
```

### ✅ Verify Data

```bash
npx prisma studio
```

This opens a browser interface to view your database.

---

**Continue to next comment for STEP 5-10...**
