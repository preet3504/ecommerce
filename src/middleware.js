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
