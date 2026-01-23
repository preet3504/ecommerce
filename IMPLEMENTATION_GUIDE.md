# E-Commerce Platform - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Setup](#project-setup)
4. [Database Schema](#database-schema)
5. [Folder Structure](#folder-structure)
6. [Authentication Flow](#authentication-flow)
7. [User Workflows](#user-workflows)
8. [Admin Workflows](#admin-workflows)
9. [Navigation Flow](#navigation-flow)
10. [API Endpoints](#api-endpoints)
11. [Step-by-Step Implementation](#step-by-step-implementation)

---

## Project Overview

A complete e-commerce platform built with Next.js 14, featuring role-based authentication, product management, shopping cart, wishlist, order tracking, and admin dashboard.

### Key Features
- **Unauthenticated Users:** Landing page only
- **Authenticated Users:** Browse products, cart, wishlist, checkout, order tracking
- **Admin Users:** Full CRUD operations, order management, user management, offers

### Color Theme
- **Primary:** White (#FFFFFF)
- **Secondary:** Dark (#252525)
- **Accents:** Gray shades for depth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | MySQL |
| ORM | Prisma |
| Authentication | NextAuth.js |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Payment | Stripe |
| Image Upload | Uploadthing/Cloudinary |
| Validation | Zod |
| HTTP Client | Axios |

---

## Project Setup

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest ecommerce-demo
# Choose: Yes to TypeScript (optional), Yes to Tailwind, Yes to App Router
cd ecommerce-demo
```

### Step 2: Install Dependencies

```bash
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install bcryptjs
npm install zustand
npm install axios
npm install zod
npm install react-hot-toast
npm install lucide-react
npm install @stripe/stripe-js stripe
npm install uploadthing @uploadthing/react
```

### Step 3: Install Dev Dependencies

```bash
npm install -D @types/bcryptjs
```

### Step 4: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

### Step 5: Configure Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Uploadthing (or Cloudinary)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## Database Schema

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  role          Role      @default(USER)
  image         String?
  phone         String?
  address       Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  orders        Order[]
  cart          CartItem[]
  wishlist      Wishlist[]
  reviews       Review[]
}

enum Role {
  USER
  ADMIN
}

model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String    @db.Text
  price         Float
  discountPrice Float?
  stock         Int
  images        String[]  @db.Json
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  featured      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
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
  id          String    @id @default(cuid())
  title       String
  description String
  discount    Float
  code        String?   @unique
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  
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

### Run Prisma Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Folder Structure

```
ecommerce-demo/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   └── signup/
│   │   │       └── page.jsx
│   │   ├── (user)/
│   │   │   ├── layout.jsx
│   │   │   ├── products/
│   │   │   │   ├── page.jsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.jsx
│   │   │   ├── cart/
│   │   │   │   └── page.jsx
│   │   │   ├── wishlist/
│   │   │   │   └── page.jsx
│   │   │   ├── checkout/
│   │   │   │   └── page.jsx
│   │   │   ├── orders/
│   │   │   │   ├── page.jsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.jsx
│   │   │   └── profile/
│   │   │       └── page.jsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.jsx
│   │   │       ├── dashboard/
│   │   │       │   └── page.jsx
│   │   │       ├── products/
│   │   │       │   ├── page.jsx
│   │   │       │   ├── create/
│   │   │       │   │   └── page.jsx
│   │   │       │   └── edit/[id]/
│   │   │       │       └── page.jsx
│   │   │       ├── orders/
│   │   │       │   ├── page.jsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.jsx
│   │   │       ├── users/
│   │   │       │   └── page.jsx
│   │   │       ├── categories/
│   │   │       │   └── page.jsx
│   │   │       └── offers/
│   │   │           ├── page.jsx
│   │   │           └── create/
│   │   │               └── page.jsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.js
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.js
│   │   │   ├── products/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── cart/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── wishlist/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── orders/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── users/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── categories/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   └── offers/
│   │   │       ├── route.js
│   │   │       └── [id]/
│   │   │           └── route.js
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── UserSidebar.jsx
│   │   │   └── AdminSidebar.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Table.jsx
│   │   ├── products/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductFilter.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── cart/
│   │   │   ├── CartItem.jsx
│   │   │   └── CartSummary.jsx
│   │   ├── orders/
│   │   │   ├── OrderCard.jsx
│   │   │   └── OrderTracking.jsx
│   │   ├── admin/
│   │   │   ├── ProductForm.jsx
│   │   │   ├── OrderTable.jsx
│   │   │   ├── UserTable.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── OfferForm.jsx
│   │   └── landing/
│   │       ├── Hero.jsx
│   │       ├── Features.jsx
│   │       └── CTASection.jsx
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── auth.js
│   │   └── utils.js
│   ├── middleware.js
│   └── store/
│       ├── cartStore.js
│       └── wishlistStore.js
├── public/
│   └── images/
├── .env
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```


---

## Authentication Flow

### 1. Unauthenticated User Flow

```
Landing Page (/)
├── View: Hero section, features, product preview
├── Actions: Click "Login" or "Sign Up"
└── Restrictions: Cannot access any other pages
```

**What Happens:**
- User visits website
- Middleware checks authentication status
- If not authenticated, redirected to landing page
- User sees overview of platform with CTA buttons

### 2. Sign Up Flow

```
Sign Up Page (/signup)
├── Form: Name, Email, Password, Confirm Password
├── Validation: Email format, password strength
├── Submit → API: POST /api/auth/signup
└── Success → Redirect to /login
```

**Step-by-Step Process:**
1. User clicks "Sign Up" button on landing page
2. Navigates to `/signup` page
3. Fills form with name, email, password
4. Frontend validates input (Zod schema)
5. Submits to API endpoint
6. API checks if email already exists
7. Hashes password with bcrypt
8. Creates user in database with role=USER
9. Returns success message
10. Redirects to login page

**API Logic:**
```javascript
// POST /api/auth/signup
1. Validate request body
2. Check if email exists
3. Hash password
4. Create user with Prisma
5. Return success response
```

### 3. Login Flow

```
Login Page (/login)
├── Form: Email, Password
├── Submit → NextAuth credentials provider
├── Success → Session created
└── Redirect based on role:
    ├── USER → /products
    └── ADMIN → /admin/dashboard
```

**Step-by-Step Process:**
1. User enters email and password
2. Submits form
3. NextAuth validates credentials
4. Queries database for user
5. Compares password hash
6. Creates JWT token with user info + role
7. Sets session cookie
8. Middleware checks role
9. Redirects to appropriate dashboard

**Session Structure:**
```javascript
{
  user: {
    id: "user_id",
    email: "user@example.com",
    name: "John Doe",
    role: "USER" // or "ADMIN"
  }
}
```

### 4. Middleware Protection

```javascript
// middleware.js
1. Check if route requires authentication
2. Verify session exists
3. Check user role for admin routes
4. Allow/deny access or redirect
```

**Protected Routes:**
- `/products/*` - Requires authentication (USER or ADMIN)
- `/cart/*` - Requires authentication (USER or ADMIN)
- `/wishlist/*` - Requires authentication (USER or ADMIN)
- `/orders/*` - Requires authentication (USER or ADMIN)
- `/checkout/*` - Requires authentication (USER or ADMIN)
- `/admin/*` - Requires authentication (ADMIN only)

---

## User Workflows

### 1. Browse Products Flow

```
Products Page (/products)
├── Display: Product grid with filters
├── Filters: Category, price range, search
├── Actions: View details, Add to cart, Add to wishlist
└── Pagination: Load more products
```

**Step-by-Step:**
1. User logs in successfully
2. Redirected to `/products`
3. API fetches products: GET `/api/products`
4. Products displayed in grid layout
5. User can filter by category
6. User can search by name
7. User can sort by price/date
8. Click product card → Navigate to `/products/[id]`

**What Happens Behind the Scenes:**
- API queries database with filters
- Applies pagination (20 products per page)
- Returns product data with images
- Frontend renders ProductCard components
- Zustand store manages filter state

### 2. Product Detail Flow

```
Product Detail Page (/products/[id])
├── Display: Images, description, price, stock
├── Actions:
│   ├── Add to Cart (quantity selector)
│   ├── Add to Wishlist (heart icon)
│   └── View Reviews
└── Related Products section
```

**Step-by-Step:**
1. User clicks product card
2. Navigate to `/products/[id]`
3. API fetches product: GET `/api/products/[id]`
4. Display product details
5. User selects quantity
6. User clicks "Add to Cart"
7. API call: POST `/api/cart`
8. Cart store updates
9. Toast notification: "Added to cart"
10. Cart icon badge updates with count

**API Flow for Add to Cart:**
```
1. Check if product in stock
2. Check if item already in cart
3. If exists, update quantity
4. If new, create cart item
5. Return updated cart
```

### 3. Shopping Cart Flow

```
Cart Page (/cart)
├── Display: Cart items with images, prices
├── Actions:
│   ├── Update quantity (+/-)
│   ├── Remove item
│   └── Proceed to Checkout
└── Summary: Subtotal, tax, total
```

**Step-by-Step:**
1. User clicks cart icon in navbar
2. Navigate to `/cart`
3. API fetches cart: GET `/api/cart`
4. Display all cart items
5. User updates quantity → PUT `/api/cart`
6. User removes item → DELETE `/api/cart/[id]`
7. Cart summary recalculates
8. User clicks "Proceed to Checkout"
9. Navigate to `/checkout`

**Real-time Updates:**
- Quantity change triggers API call
- Response updates cart store
- UI re-renders with new totals
- Stock validation on backend

### 4. Wishlist Flow

```
Wishlist Page (/wishlist)
├── Display: Saved products
├── Actions:
│   ├── Move to Cart
│   ├── Remove from Wishlist
│   └── View Product Details
└── Empty state if no items
```

**Step-by-Step:**
1. User clicks heart icon on product
2. API call: POST `/api/wishlist`
3. Product added to wishlist
4. Heart icon fills with color
5. User navigates to `/wishlist`
6. API fetches wishlist: GET `/api/wishlist`
7. Display saved products
8. User clicks "Move to Cart"
9. API: POST `/api/cart` + DELETE `/api/wishlist/[id]`
10. Product moved to cart

### 5. Checkout Flow

```
Checkout Page (/checkout)
├── Step 1: Shipping Address
│   └── Form: Name, address, phone, city, zip
├── Step 2: Payment Method
│   └── Options: Card, COD
├── Step 3: Order Review
│   └── Display: Items, address, total
└── Submit → Create Order
```

**Step-by-Step:**
1. User at `/checkout`
2. Fill shipping address form
3. Select payment method
4. Review order summary
5. Click "Place Order"
6. If card payment:
   - Stripe payment modal opens
   - User enters card details
   - Stripe processes payment
   - Returns payment ID
7. API call: POST `/api/orders`
8. Backend creates order
9. Clears cart
10. Generates order number
11. Creates order tracking entry
12. Redirects to `/orders/[orderId]`
13. Shows success message

**API Order Creation Flow:**
```
1. Validate cart items
2. Check stock availability
3. Calculate total amount
4. Create order record
5. Create order items
6. Create initial tracking entry
7. Update product stock
8. Clear user cart
9. Send confirmation email (optional)
10. Return order details
```

### 6. Order Tracking Flow

```
Order Detail Page (/orders/[id])
├── Display: Order summary
├── Tracking Timeline:
│   ├── Order Placed
│   ├── Confirmed
│   ├── Processing
│   ├── Shipped
│   └── Delivered
└── Actions: Cancel order (if pending)
```

**Step-by-Step:**
1. User navigates to `/orders`
2. API fetches orders: GET `/api/orders`
3. Display order history
4. User clicks order card
5. Navigate to `/orders/[id]`
6. API fetches order details: GET `/api/orders/[id]`
7. Display order items and tracking
8. Tracking timeline shows current status
9. Real-time updates (if implemented with polling/websockets)

**Order Status Progression:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                  ↓
                              CANCELLED (if user cancels)
```

### 7. User Profile Flow

```
Profile Page (/profile)
├── Display: User info, addresses
├── Actions:
│   ├── Update profile
│   ├── Change password
│   └── Manage addresses
└── Order history link
```

**Step-by-Step:**
1. User clicks profile icon
2. Navigate to `/profile`
3. Display user information
4. User edits name/phone
5. Submits form
6. API call: PUT `/api/users/[id]`
7. Updates database
8. Shows success message
9. Session updates with new info

---

## Admin Workflows

### 1. Admin Dashboard Flow

```
Admin Dashboard (/admin/dashboard)
├── Stats Cards:
│   ├── Total Revenue
│   ├── Total Orders
│   ├── Total Products
│   └── Total Users
├── Recent Orders Table
└── Quick Actions
```

**Step-by-Step:**
1. Admin logs in
2. Middleware checks role=ADMIN
3. Redirected to `/admin/dashboard`
4. API fetches stats: GET `/api/admin/stats`
5. Display metrics
6. Show recent orders
7. Admin can navigate to different sections

**What Data is Displayed:**
- Revenue: Sum of all paid orders
- Orders: Count by status
- Products: Total count and low stock alerts
- Users: Total registered users
- Charts: Sales over time (optional)

### 2. Product Management Flow

```
Admin Products (/admin/products)
├── Display: Products table with search
├── Actions:
│   ├── Create New Product
│   ├── Edit Product
│   ├── Delete Product
│   └── Toggle Featured
└── Filters: Category, stock status
```

**Create Product Flow:**
1. Admin clicks "Create Product"
2. Navigate to `/admin/products/create`
3. Fill form:
   - Name, description
   - Price, discount price
   - Stock quantity
   - Category selection
   - Upload images
4. Submit form
5. API call: POST `/api/products`
6. Backend validates data
7. Uploads images to storage
8. Creates product in database
9. Redirects to products list
10. Shows success message

**Edit Product Flow:**
1. Admin clicks "Edit" on product row
2. Navigate to `/admin/products/edit/[id]`
3. Form pre-filled with existing data
4. Admin modifies fields
5. Submit form
6. API call: PUT `/api/products/[id]`
7. Updates database
8. Redirects back to list

**Delete Product Flow:**
1. Admin clicks "Delete" button
2. Confirmation modal appears
3. Admin confirms deletion
4. API call: DELETE `/api/products/[id]`
5. Checks if product in active orders
6. If safe, deletes product
7. Removes from list
8. Shows success message

### 3. Order Management Flow

```
Admin Orders (/admin/orders)
├── Display: Orders table with filters
├── Filters: Status, date range, payment status
├── Actions:
│   ├── View Order Details
│   ├── Update Order Status
│   └── Add Tracking Info
└── Export orders (optional)
```

**Update Order Status Flow:**
1. Admin views order list
2. Clicks order to view details
3. Navigate to `/admin/orders/[id]`
4. Display full order information
5. Admin selects new status from dropdown
6. Optionally adds tracking message
7. Clicks "Update Status"
8. API call: PUT `/api/orders/[id]`
9. Updates order status
10. Creates tracking entry
11. Sends notification to user (optional)
12. Updates UI with new status

**Order Status Management:**
```
Admin Actions:
- PENDING → CONFIRMED (verify payment)
- CONFIRMED → PROCESSING (preparing order)
- PROCESSING → SHIPPED (add tracking number)
- SHIPPED → DELIVERED (confirm delivery)
- Any status → CANCELLED (with reason)
```

### 4. User Management Flow

```
Admin Users (/admin/users)
├── Display: Users table
├── Columns: Name, email, role, join date
├── Actions:
│   ├── Change User Role
│   ├── View User Orders
│   └── Deactivate User (optional)
└── Search and filters
```

**Change Role Flow:**
1. Admin views users list
2. Finds user to promote/demote
3. Clicks role dropdown
4. Selects new role (USER/ADMIN)
5. Confirmation modal
6. API call: PUT `/api/users/[id]`
7. Updates user role
8. Shows success message

### 5. Category Management Flow

```
Admin Categories (/admin/categories)
├── Display: Categories list
├── Actions:
│   ├── Create Category
│   ├── Edit Category
│   └── Delete Category
└── Shows product count per category
```

**Create Category Flow:**
1. Admin clicks "Add Category"
2. Modal/form appears
3. Fill: Name, slug, description, image
4. Submit
5. API call: POST `/api/categories`
6. Creates category
7. Updates list
8. Available in product forms

### 6. Offers Management Flow

```
Admin Offers (/admin/offers)
├── Display: Active and expired offers
├── Actions:
│   ├── Create Offer
│   ├── Edit Offer
│   ├── Assign to Products
│   └── Toggle Active Status
└── Shows offer usage stats
```

**Create Offer Flow:**
1. Admin clicks "Create Offer"
2. Navigate to `/admin/offers/create`
3. Fill form:
   - Title, description
   - Discount percentage
   - Start and end dates
   - Offer code (optional)
4. Submit form
5. API call: POST `/api/offers`
6. Creates offer
7. Navigate to assign products
8. Select products for offer
9. API call: POST `/api/offers/[id]/products`
10. Links products to offer
11. Offer becomes active
12. Products show discounted price

**How Offers Work:**
- Offer has discount percentage
- Linked to specific products
- Active between start and end dates
- Frontend calculates discounted price
- Shows original price with strikethrough
- Displays discount badge


---

## Navigation Flow

### Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    UNAUTHENTICATED                          │
│                                                             │
│  Landing Page (/)                                           │
│  ├── Login (/login)                                         │
│  └── Sign Up (/signup)                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ After Login
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLE                                │
│                                                             │
│  Products (/products)                                       │
│  ├── Product Detail (/products/[id])                        │
│  │   ├── Add to Cart → Cart Page                           │
│  │   └── Add to Wishlist → Wishlist Page                   │
│  │                                                          │
│  Cart (/cart)                                               │
│  └── Checkout (/checkout)                                   │
│      └── Order Success → Order Detail                       │
│                                                             │
│  Wishlist (/wishlist)                                       │
│  └── Move to Cart → Cart Page                              │
│                                                             │
│  Orders (/orders)                                           │
│  └── Order Detail (/orders/[id])                            │
│      └── Track Order (timeline view)                        │
│                                                             │
│  Profile (/profile)                                         │
│  └── Edit Profile, Change Password                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN ROLE                               │
│                                                             │
│  Dashboard (/admin/dashboard)                               │
│  ├── Stats Overview                                         │
│  └── Quick Actions                                          │
│                                                             │
│  Products (/admin/products)                                 │
│  ├── Create Product (/admin/products/create)                │
│  └── Edit Product (/admin/products/edit/[id])               │
│                                                             │
│  Orders (/admin/orders)                                     │
│  └── Order Detail (/admin/orders/[id])                      │
│      └── Update Status, Add Tracking                        │
│                                                             │
│  Users (/admin/users)                                       │
│  └── Manage Roles, View User Details                        │
│                                                             │
│  Categories (/admin/categories)                             │
│  └── CRUD Operations                                        │
│                                                             │
│  Offers (/admin/offers)                                     │
│  ├── Create Offer (/admin/offers/create)                    │
│  └── Assign to Products                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navbar Navigation

**Unauthenticated Navbar:**
```
Logo | [Login] [Sign Up]
```

**User Navbar:**
```
Logo | Products | Orders | Wishlist | [Cart Icon (badge)] | [Profile Dropdown]
                                                              ├── Profile
                                                              └── Logout
```

**Admin Navbar:**
```
Logo | Dashboard | Products | Orders | Users | Categories | Offers | [Profile Dropdown]
                                                                      ├── Profile
                                                                      └── Logout
```

### Sidebar Navigation (Mobile)

**User Sidebar:**
- Products
- Cart
- Wishlist
- Orders
- Profile
- Logout

**Admin Sidebar:**
- Dashboard
- Products
- Orders
- Users
- Categories
- Offers
- Settings
- Logout

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/auth/signup` | Register new user | No | - |
| POST | `/api/auth/[...nextauth]` | Login (NextAuth) | No | - |
| GET | `/api/auth/session` | Get current session | Yes | - |

### Product Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/products` | List products (with filters) | Yes | USER/ADMIN |
| GET | `/api/products/[id]` | Get product details | Yes | USER/ADMIN |
| POST | `/api/products` | Create product | Yes | ADMIN |
| PUT | `/api/products/[id]` | Update product | Yes | ADMIN |
| DELETE | `/api/products/[id]` | Delete product | Yes | ADMIN |

**Query Parameters for GET /api/products:**
- `category` - Filter by category ID
- `search` - Search by name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort by (price_asc, price_desc, newest)
- `page` - Page number
- `limit` - Items per page

### Cart Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/cart` | Get user cart | Yes | USER/ADMIN |
| POST | `/api/cart` | Add item to cart | Yes | USER/ADMIN |
| PUT | `/api/cart/[id]` | Update cart item quantity | Yes | USER/ADMIN |
| DELETE | `/api/cart/[id]` | Remove item from cart | Yes | USER/ADMIN |

**Request Body for POST /api/cart:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

### Wishlist Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/wishlist` | Get user wishlist | Yes | USER/ADMIN |
| POST | `/api/wishlist` | Add to wishlist | Yes | USER/ADMIN |
| DELETE | `/api/wishlist/[id]` | Remove from wishlist | Yes | USER/ADMIN |

### Order Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/orders` | List user orders | Yes | USER/ADMIN |
| GET | `/api/orders/[id]` | Get order details | Yes | USER/ADMIN |
| POST | `/api/orders` | Create order | Yes | USER/ADMIN |
| PUT | `/api/orders/[id]` | Update order status | Yes | ADMIN |

**Request Body for POST /api/orders:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "card",
  "stripePaymentId": "pi_xxx" // if card payment
}
```

### User Endpoints (Admin)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/users` | List all users | Yes | ADMIN |
| GET | `/api/users/[id]` | Get user details | Yes | ADMIN |
| PUT | `/api/users/[id]` | Update user (role) | Yes | ADMIN |

### Category Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/categories` | List categories | Yes | USER/ADMIN |
| POST | `/api/categories` | Create category | Yes | ADMIN |
| PUT | `/api/categories/[id]` | Update category | Yes | ADMIN |
| DELETE | `/api/categories/[id]` | Delete category | Yes | ADMIN |

### Offer Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/offers` | List offers | Yes | ADMIN |
| GET | `/api/offers/[id]` | Get offer details | Yes | ADMIN |
| POST | `/api/offers` | Create offer | Yes | ADMIN |
| PUT | `/api/offers/[id]` | Update offer | Yes | ADMIN |
| DELETE | `/api/offers/[id]` | Delete offer | Yes | ADMIN |
| POST | `/api/offers/[id]/products` | Assign products to offer | Yes | ADMIN |

---

## Step-by-Step Implementation

### Phase 1: Project Foundation (Week 1)

#### Step 1: Initialize Project
```bash
npx create-next-app@latest ecommerce-demo
cd ecommerce-demo
```

#### Step 2: Install Dependencies
```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs zustand axios zod react-hot-toast lucide-react
npm install -D @types/bcryptjs
```

#### Step 3: Setup Prisma
```bash
npx prisma init
```

Edit `prisma/schema.prisma` with the complete schema provided above.

#### Step 4: Configure Environment Variables
Create `.env` file with database URL and NextAuth secret.

#### Step 5: Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Step 6: Configure Tailwind
Edit `tailwind.config.js`:
```javascript
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

#### Step 7: Setup Global Styles
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

### Phase 2: Authentication System (Week 1-2)

#### Step 1: Create Prisma Client
Create `src/lib/prisma.js`:
```javascript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Step 2: Setup NextAuth
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

#### Step 3: Create NextAuth API Route
Create `src/app/api/auth/[...nextauth]/route.js`:
```javascript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

#### Step 4: Create Signup API
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

#### Step 5: Create Middleware
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

#### Step 6: Create Login Page
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

#### Step 7: Create Signup Page
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

    setLoading(true)

    try {
      await axios.post("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      router.push("/login")
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
            {loading ? "Loading..." : "Sign Up"}
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


### Phase 3: Landing Page (Week 2)

#### Step 1: Create Landing Page
Create `src/app/page.jsx`:
```javascript
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect authenticated users
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

### Phase 4: UI Components (Week 2-3)

#### Create Reusable Components

**Button Component** - `src/components/ui/Button.jsx`:
```javascript
export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-secondary text-white hover:bg-accent-700",
    secondary: "bg-white text-secondary border-2 border-secondary hover:bg-accent-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  }

  return (
    <button
      className={`px-4 py-2 rounded-lg transition font-semibold ${variants[variant]} disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Card Component** - `src/components/ui/Card.jsx`:
```javascript
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-accent-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  )
}
```

**Badge Component** - `src/components/ui/Badge.jsx`:
```javascript
export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-accent-200 text-secondary",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700"
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

### Phase 5: Product System (Week 3-4)

#### Step 1: Create Products API
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
    if (search) where.name = { contains: search }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        offers: {
          include: { offer: true }
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
    const { name, description, price, stock, categoryId, images } = body

    const slug = name.toLowerCase().replace(/\s+/g, "-")

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        images
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
```

#### Step 2: Create Product Detail API
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
          include: { user: { select: { name: true } } }
        },
        offers: {
          include: { offer: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
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
      data: body
    })

    return NextResponse.json(product)
  } catch (error) {
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

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
```

#### Step 3: Create Products Page
Create `src/app/(user)/products/page.jsx`:
```javascript
"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import Card from "@/components/ui/Card"

export default function ProductsPage() {
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
      console.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-secondary mb-8">Products</h1>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 border border-accent-300 rounded mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer">
                <img
                  src={product.images[0] || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-secondary mb-2">{product.name}</h3>
                  <p className="text-accent-600 text-sm mb-2">{product.category.name}</p>
                  <p className="text-lg font-bold text-secondary">${product.price}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Phase 6: Cart & Wishlist (Week 4-5)

#### Create Cart API
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
      }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
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

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
      return NextResponse.json(updated)
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity
      }
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}
```

### Phase 7: Orders System (Week 5-6)

#### Create Orders API
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

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true }
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

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`

    // Create order
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
            status: "PENDING",
            message: "Order placed successfully"
          }
        }
      },
      include: {
        items: { include: { product: true } },
        tracking: true
      }
    })

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })

    // Update product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
```

### Phase 8: Admin Dashboard (Week 6-7)

#### Create Admin Dashboard
Create `src/app/(admin)/admin/dashboard/page.jsx`:
```javascript
"use client"
import { useState, useEffect } from "react"
import { prisma } from "@/lib/prisma"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // Fetch stats from API
    // Implementation here
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-secondary mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-accent-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-secondary">${stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-accent-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-accent-600 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-accent-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-secondary">{stats.totalUsers}</p>
        </div>
      </div>
    </div>
  )
}
```

---

## Testing & Deployment

### Testing Checklist

**Authentication:**
- [ ] User can sign up
- [ ] User can login
- [ ] Session persists
- [ ] Middleware protects routes
- [ ] Admin routes restricted

**User Features:**
- [ ] Browse products
- [ ] Search and filter
- [ ] Add to cart
- [ ] Update cart quantity
- [ ] Add to wishlist
- [ ] Checkout process
- [ ] Order creation
- [ ] Order tracking
- [ ] Profile management

**Admin Features:**
- [ ] View dashboard stats
- [ ] Create products
- [ ] Edit products
- [ ] Delete products
- [ ] Manage orders
- [ ] Update order status
- [ ] Manage users
- [ ] Create offers

### Deployment Steps

#### 1. Database Setup
```bash
# Production database
# Use PlanetScale, Railway, or AWS RDS
```

#### 2. Environment Variables
```env
DATABASE_URL="production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret"
```

#### 3. Deploy to Vercel
```bash
npm run build
vercel --prod
```

---

## Summary

This guide provides a complete roadmap for building a full-featured e-commerce platform with:

✅ Role-based authentication (User/Admin)
✅ Product catalog with search and filters
✅ Shopping cart and wishlist
✅ Checkout and payment integration
✅ Order tracking system
✅ Admin dashboard with full CRUD
✅ Offer management system
✅ Modern UI with white + #252525 theme

**Total Development Time:** 10-12 weeks
**Lines of Code:** ~15,000+
**Database Tables:** 11 models
**API Endpoints:** 30+ routes
**Pages:** 20+ pages

Follow each phase sequentially for best results. Good luck with your e-commerce platform! 🚀
