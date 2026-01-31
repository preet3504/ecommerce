import Navbar from "@/components/layout/Navbar"

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
