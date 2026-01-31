"use client"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"

export default function UserLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>{children}</main>
      </div>
    </SessionProvider>
  )
}
