import { create } from 'zustand'

const useCartStore = create((set) => ({
  cartCount: 0,
  wishlistCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  setWishlistCount: (count) => set({ wishlistCount: count }),
  refreshCartCount: async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        set({ cartCount: data.length })
      }
    } catch (error) {
      console.error('Failed to refresh cart count:', error)
    }
  },
  refreshWishlistCount: async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        set({ wishlistCount: data.length })
      }
    } catch (error) {
      console.error('Failed to refresh wishlist count:', error)
    }
  }
}))

export default useCartStore
