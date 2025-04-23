"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink } from "lucide-react"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (pathname?.startsWith("/auqli-tools")) {
      setShouldRender(false)
    } else {
      setShouldRender(true)
    }

    // Log for debugging
    console.log("Current path:", pathname, "Should render header:", pathname?.startsWith("/auqli-tools") ? false : true)
  }, [pathname])

  // Handle scroll event to make navbar sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Skip rendering this header for auqli-tools routes
  if (!shouldRender) {
    return null
  }

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled ? "bg-[#0a0f1a]/95 backdrop-blur-md border-gray-800/50 shadow-md" : "bg-[#0a0f1a] border-gray-800"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center z-10">
            <div className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MARK-rlaHxgk2H2Z1pLvKYo7HsSBa801gp4.png"
                alt="Auqli Logo"
                width={36}
                height={36}
                className="h-9 w-auto"
                priority
              />
              <span className="ml-2 text-xl font-semibold text-white">Auqli Nexus</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/converter" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span>CSV Converter</span>
            </Link>
            <Link href="/imagegen" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span>ImageGen AI</span>
            </Link>
            <Link href="/copygen" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span>CopyGen AI</span>
            </Link>
            <Link href="/bloggen" className="flex items-center text-gray-300 hover:text-white transition-colors">
              <span>BlogGen AI</span>
            </Link>
            <Link
              href="https://auqli.live/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <span>Blog</span>
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:block"></div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors z-10"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0a0f1a] border-t border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">Pricing</span>
                </Link>

                <Link
                  href="/converter"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">CSV Converter</span>
                </Link>

                <Link
                  href="/imagegen"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">ImageGen AI</span>
                </Link>

                <Link
                  href="/copygen"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">CopyGen AI</span>
                </Link>

                <Link
                  href="/bloggen"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">BlogGen AI</span>
                </Link>

                <Link
                  href="https://auqli.live/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">Blog</span>
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Link>
              </nav>

              {/* Mobile CTA Button */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
