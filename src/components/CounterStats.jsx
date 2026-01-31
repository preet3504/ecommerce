"use client"
import { useEffect, useRef, useState } from "react"

export default function CounterStats() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ products: 0, customers: 0, satisfaction: 0, support: 0 })
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const targets = { products: 10, customers: 50, satisfaction: 99, support: 24 }
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounts({
        products: Math.floor(targets.products * progress),
        customers: Math.floor(targets.customers * progress),
        satisfaction: Math.floor(targets.satisfaction * progress),
        // support: Math.floor(targets.support * progress)
      })

      if (currentStep >= steps) {
        setCounts(targets)
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible])

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="animate-fadeIn">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.products}K+
            </div>
            <div className="text-accent-300">Products</div>
          </div>
          <div className="animate-fadeIn delay-100">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.customers}K+
            </div>
            <div className="text-accent-300">Happy Customers</div>
          </div>
          <div className="animate-fadeIn delay-200">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {counts.satisfaction}%
            </div>
            <div className="text-accent-300">Satisfaction Rate</div>
          </div>
          <div className="animate-fadeIn delay-300">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              24/7
            </div>
            <div className="text-accent-300">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
