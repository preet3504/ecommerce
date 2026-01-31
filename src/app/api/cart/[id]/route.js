import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { quantity } = await request.json()

    const cartItem = await prisma.cartItem.update({
      where: {
        id,
        userId: session.user.id
      },
      data: { quantity: parseInt(quantity) },
      include: { product: true }
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.cartItem.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
  }
}
