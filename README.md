# 🛍️ Modern E-Commerce Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![NextAuth](https://img.shields.io/badge/NextAuth.js-Authentication-000000?style=for-the-badge)

A full-featured, production-ready e-commerce platform built with Next.js 14, featuring role-based authentication, complete shopping flow, and comprehensive admin dashboard.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Role-based access control (User/Admin)
- Protected routes with middleware
- Session management with NextAuth.js

### 🛒 Shopping Experience
- Browse products with search functionality
- Filter by categories
- Product detail pages with images
- Shopping cart with quantity management
- Wishlist functionality
- Secure checkout process
- Multiple payment methods (COD, Card)
- Order history and tracking

### 📊 Admin Dashboard
- Real-time statistics (Revenue, Orders, Products, Users)
- Complete product management (CRUD)
- Order management with status updates
- User management and role assignment
- Category management
- Order tracking system
- Inventory management

### 🎨 UI/UX
- Modern, clean design with white + #252525 theme
- Fully responsive layout
- Smooth animations and transitions
- Toast notifications
- Loading states
- Error handling

---

## 🎥 Demo

### User Flow
```
Landing Page → Sign Up/Login → Browse Products → Add to Cart → Checkout → Order Tracking
```

### Admin Flow
```
Admin Login → Dashboard → Manage Products/Orders/Users/Categories
```

**Test Credentials:**
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL database (local or cloud)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecommerce-demo.git
cd ecommerce-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate secret:
```bash
openssl rand -base64 32
```

4. **Setup database**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Seed database with sample data**
```bash
npx prisma db seed
```

6. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
ecommerce-demo/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Sample data
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages
│   │   ├── (user)/            # User pages
│   │   ├── (admin)/           # Admin pages
│   │   ├── api/               # API routes
│   │   └── page.jsx           # Landing page
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── middleware.js          # Route protection
├── public/                    # Static assets
└── Documentation files        # Implementation guides
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Components:** Custom components
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Authentication:** NextAuth.js
- **Validation:** Zod

### Database
- **Database:** MySQL
- **ORM:** Prisma
- **Models:** 11 tables with relationships

### DevOps
- **Version Control:** Git
- **Deployment:** Vercel (recommended)
- **Database Hosting:** PlanetScale / Railway / AWS RDS

---

## 📚 Documentation

Comprehensive step-by-step guides are included:

- **IMPLEMENTATION_GUIDE.md** - Complete architecture and workflows
- **STEP_BY_STEP_IMPLEMENTATION.md** - Detailed implementation (Part 1-5)
- **QUICK_REFERENCE.md** - Quick commands and reference
- **COMPLETE_SUMMARY.md** - Project overview and stats

---

## 🗄️ Database Schema

11 interconnected models:
- **User** - Authentication and profiles
- **Product** - Product catalog
- **Category** - Product categories
- **CartItem** - Shopping cart
- **Wishlist** - Saved products
- **Order** - Order records
- **OrderItem** - Order line items
- **OrderTracking** - Order status history
- **Offer** - Promotional offers
- **ProductOffer** - Product-offer relationships
- **Review** - Product reviews

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - Login

### Products
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Cart & Wishlist
- `GET/POST /api/cart` - Cart operations
- `PUT/DELETE /api/cart/[id]` - Update/Remove cart item
- `GET/POST /api/wishlist` - Wishlist operations
- `DELETE /api/wishlist/[id]` - Remove from wishlist

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status (Admin)

### Admin
- `GET /api/users` - List users (Admin)
- `PUT /api/users/[id]` - Update user role (Admin)
- `GET/POST /api/categories` - Category operations (Admin)

---

## 🧪 Testing

### Manual Testing
1. Sign up as a new user
2. Browse and search products
3. Add items to cart and wishlist
4. Complete checkout process
5. Track order status
6. Login as admin and manage products/orders

### Database Inspection
```bash
npx prisma studio
```

---

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Database Options
- **PlanetScale** (Recommended) - Free tier available
- **Railway** - Easy setup
- **AWS RDS** - Production-grade
- **DigitalOcean** - Managed databases

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
```

---

## 📈 Roadmap

### Phase 1 (Current)
- [x] Authentication system
- [x] Product catalog
- [x] Shopping cart
- [x] Order management
- [x] Admin dashboard

### Phase 2 (Planned)
- [ ] Stripe payment integration
- [ ] Image upload functionality
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced search filters

### Phase 3 (Future)
- [ ] Redis caching
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social media integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
- NextAuth.js for authentication solution

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation files
- Review the implementation guides

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built with ❤️ using Next.js, Prisma, and MySQL**

[⬆ Back to Top](#-modern-e-commerce-platform)

</div>
