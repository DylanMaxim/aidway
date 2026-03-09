"use client"

import { ReactElement, useEffect, useRef } from 'react'
import Image from "next/image";
import { Navbar } from '@/components/default/navbar'
import { SuperButton } from '@/components/default/button'

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const mouseXRef = useRef<number | null>(null)

  // --- Carousel Animation Logic ---
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const scrollSpeed = 0.5
    let animationFrameId: number
    const scroll = () => {
      if (!carousel) return
      const wrapVal = carousel.scrollWidth / 3
      carousel.scrollLeft += scrollSpeed
      if (carousel.scrollLeft >= wrapVal) carousel.scrollLeft -= wrapVal
      const rawMouseX = mouseXRef.current
      if (rawMouseX !== null) {
        const mouseX = rawMouseX + carousel.scrollLeft
        cardsRef.current.forEach((card, index) => {
          if (!card) return
          const cardWidth = 320 + 24
          const cardCenter = index * cardWidth + 160
          const distance = Math.abs(mouseX - cardCenter)
          const maxDistance = 400
          let scale = 1
          if (distance <= maxDistance) scale = 1 + (0.3 * (1 - distance / maxDistance))
          card.style.transform = `translateZ(0) scale(${scale})`
          card.style.zIndex = scale > 1.1 ? "10" : "1"
        })
      }
      animationFrameId = requestAnimationFrame(scroll)
    }
    animationFrameId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar with your specific buttons */}
      <Navbar>
        <div className="flex gap-4">
          <SuperButton name="Request Supplies" path="/submitRequest" variant={1} />
          <SuperButton name="Manage group" path="/group" variant={1} />
        </div>
      </Navbar>

      {/* Hero Section: The "Impact" Look */}
      <div className="relative min-h-[85vh] flex items-center px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/supplies.jpg"
            alt="Aid Background"
            fill
            className="object-cover"
            priority
          />
          {/* Scrim: Dark gradient on the left, fading to transparent on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Periods don't stop <br />
              <span className="text-[var(--color_red)]">in a crisis.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
              AIDWAY aims to deliver period products during humanitarian disasters. 
              Find out how to help and ensure dignity for all.
            </p>
            <button className="bg-[var(--color_red)] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-red-900/20">
              Get Involved
            </button>
          </div>
        </div>
      </div>

      {/* Registration Section: Clean and Structured */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-[var(--color_red)] pl-4">
              To register with us...
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "1", title: "Charity Link", desc: "Users in a camp must first register with an authorized local charity." },
              { num: "2", title: "Access Codes", desc: "Charities register with us to receive a unique secure access code." },
              { num: "3", title: "Unique ID", desc: "Every individual camp will be assigned its own unique access code." },
              { num: "4", title: "Submit Request", desc: "Users in different camps can then submit the form for specific needs." }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:translate-y-[-4px] transition-all">
                <div className="text-[var(--color_red)] font-bold text-lg mb-4">Step {step.num}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logistics Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">After Registration</h2>
            <div className="space-y-6">
              {[
                "Each camp will be assigned a dedicated camp correspondent.",
                "The correspondent ensures each user receives their requested products.",
                "Ordered products are delivered reliably on a monthly basis."
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-[var(--color_red)] flex items-center justify-center flex-shrink-0 mt-1 font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-lg text-gray-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&q=80"
              alt="Aid Distribution"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Partners/Carousel Area (Add your carousel code here) */}
      <div className="py-20 text-center">
        <p className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-12">Supported by leading organizations</p>
        {/* Your carousel div would go here */}
      </div>

    </main>
  );
}