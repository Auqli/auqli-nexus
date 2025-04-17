"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

// Tool data for dropdown menu
const tools = [
  {
    name: "CSV Converter",
    href: "/converter",
    description: "Convert and prepare product CSVs for bulk uploads",
    color: "bg-emerald-500",
    isAvailable: true,
  },
  {
    name: "ImageGen AI",
    href: "/imagegen",
    description: "Generate high-quality product photos and visuals",
    color: "bg-purple-500",
    isAvailable: true,
  },
  {
    name: "CopyGen AI",
    href: "/copygen",
    description: "Create powerful product titles and descriptions",
    color: "bg-blue-500",
    isAvailable: true,
  },
  {
    name: "BlogGen AI",
    href: "/bloggen",
    description: "Generate SEO-optimized blog articles",
    color: "bg-amber-500",
    isAvailable: true,
  },
  {
    name: "CaptionGen AI",
    href: "/captiongen",
    description: "Auto-generate subtitles for videos in multiple languages",
    color: "bg-orange-500",
    isAvailable: false,
  },
  {
    name: "VoiceBlog AI",
    href: "/voiceblog",
    description: "Turn voice notes into full blog posts",
    color: "bg-red-700",
    isAvailable: false,
  },
  {
    name: "ClipSlash AI",
    href: "/clipslash",
    description: "Cut long videos into viral clips automatically",
    color: "bg-red-500",
    isAvailable: false,
  },
  {
    name: "IdeaSpark AI",
    href: "/ideaspark",
    description: "Generate video ideas, hooks, and shot lists",
    color: "bg-yellow-500",
    isAvailable: false,
  },
  {
    name: "CVBoost AI",
    href: "/cvboost",
    description: "Optimize your CV and generate cover letters",
    color: "bg-purple-600",
    isAvailable: false,
  },
  {
    name: "ThreadGen AI",
    href: "/threadgen",
    description: "Convert content into Twitter/X threads",
    color: "bg-blue-600",
    isAvailable: false,
  },
  {
    name: "FlexGen AI",
    href: "/flexgen",
    description: "Generate WhatsApp bios and matching profile pics",
    color: "bg-red-700",
    isAvailable: false,
  },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const pathname = usePathname()
  const toolsDropdownRef = useRef<HTMLDivElement>(null)

  // Handle scroll event to make navbar sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleToolsDropdown = () => setIsToolsOpen(!isToolsOpen)

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
                src="/images/auqli-symbol.png"
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
            <a
              href="https://auqli.live/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <span>About</span>
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>

            <a
              href="https://auqli.live/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <span>Blog</span>
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>

            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                onClick={toggleToolsDropdown}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <span>Tools</span>
                {isToolsOpen ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </button>

              {/* Tools Dropdown Menu */}
              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-[#111827] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="max-h-[70vh] overflow-y-auto py-2">
                      {tools.map((tool, index) => (
                        <Link
                          key={index}
                          href={tool.href}
                          className="flex items-start px-4 py-3 hover:bg-gray-800 transition-colors"
                          onClick={() => setIsToolsOpen(false)}
                        >
                          <div className={`${tool.color} rounded-full p-2 mr-3 flex-shrink-0`}>
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-white">{tool.name}</span>
                              {!tool.isAvailable && (
                                <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-0.5">{tool.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Sign Up
            </Button>
            <Button className="bg-[#16783a] hover:bg-[#225b35] text-white">Login</Button>
          </div>

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
                <a
                  href="https://auqli.live/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">About</span>
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>

                <a
                  href="https://auqli.live/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">Blog</span>
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>

                <Link
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                >
                  <span className="font-medium">Pricing</span>
                </Link>

                {/* Mobile Tools Dropdown */}
                <div className="space-y-2">
                  <div className="px-3 py-2.5 text-gray-300 font-medium">Tools</div>
                  <div className="pl-3 space-y-1">
                    {tools.map((tool, index) => (
                      <Link
                        key={index}
                        href={tool.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
                      >
                        <div className={`${tool.color} w-2 h-2 rounded-full mr-2`}></div>
                        <span>{tool.name}</span>
                        {!tool.isAvailable && (
                          <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-2 flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Sign Up
                  </Button>
                  <Button className="w-full bg-[#16783a] hover:bg-[#225b35] text-white">Login</Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
