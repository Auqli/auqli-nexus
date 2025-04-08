"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <motion.header
      className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MARK-rlaHxgk2H2Z1pLvKYo7HsSBa801gp4.png"
              alt="Auqli Logo"
              width={36}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <span className="ml-2 text-xl font-semibold text-gray-800">Auqli Nexus</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-700 hover:text-[#16783a] transition-colors font-medium">
            Home
          </Link>
          <Link href="/converter" className="text-gray-700 hover:text-[#16783a] transition-colors font-medium">
            CSV Converter
          </Link>
          <Link
            href="https://auqli.live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-[#16783a] transition-colors font-medium"
          >
            Sell on Auqli
          </Link>
          <Button asChild className="bg-[#16783a] hover:bg-[#225b35] rounded-md px-6 py-2 text-white">
            <a href="https://www.auqli.live/sell" target="_blank" rel="noopener noreferrer">
              Start Selling
            </a>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-[#16783a] transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-b border-gray-200"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/converter"
              className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              CSV Converter
            </Link>
            <Link
              href="https://auqli.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#16783a] transition-colors py-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sell on Auqli
            </Link>
            <Button asChild className="bg-[#16783a] hover:bg-[#225b35] w-full rounded-md py-2 text-white">
              <a
                href="https://www.auqli.live/sell"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Selling
              </a>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
