"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  ChevronDown,
  PenTool,
  Download,
  Search,
  LucideImage,
  Share2,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Tool items for dropdown
const toolItems = [
  {
    name: "AI CopyGen",
    href: "/copywriting",
    icon: <PenTool className="h-4 w-4" />,
    badge: { text: "AI", color: "bg-gradient-to-r from-[#16783a] to-[#45c133]" },
    isExternal: false,
    isAvailable: true,
  },
  {
    name: "CSV Converter",
    href: "/converter",
    icon: <Download className="h-4 w-4" />,
    badge: { text: "Popular", color: "bg-amber-500" },
    isExternal: false,
    isAvailable: true,
  },
  {
    name: "AI Product Search",
    href: "/product-search",
    icon: <Search className="h-4 w-4" />,
    badge: { text: "Coming Soon", color: "bg-gray-500" },
    isExternal: false,
    isAvailable: false,
  },
  {
    name: "AI ImageGen",
    href: "/imagegen",
    icon: <LucideImage className="h-4 w-4" />,
    badge: { text: "AI", color: "bg-gradient-to-r from-[#16783a] to-[#45c133]" },
    isExternal: false,
    isAvailable: true,
  },
  {
    name: "AI SocialGen",
    href: "/socialgen",
    icon: <Share2 className="h-4 w-4" />,
    badge: { text: "Coming Soon", color: "bg-gray-500" },
    isExternal: false,
    isAvailable: false,
  },
  {
    name: "Auqli NexChat",
    href: "/nexchat",
    icon: <MessageSquare className="h-4 w-4" />,
    badge: { text: "New", color: "bg-blue-500" },
    isExternal: false,
    isAvailable: false,
  },
]

// Navigation items
const navItems = [
  { name: "Home", href: "/", isExternal: false },
  {
    name: "Tools",
    href: "#",
    isDropdown: true,
    badge: { text: "AI", color: "bg-gradient-to-r from-[#16783a] to-[#45c133]" },
    items: toolItems,
  },
  { name: "Pricing", href: "/pricing", isExternal: false },
  { name: "Blog", href: "https://auqli.live/blog", isExternal: true },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolsButtonRef = useRef<HTMLButtonElement>(null)

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        toolsButtonRef.current &&
        !toolsButtonRef.current.contains(event.target as Node)
      ) {
        setIsToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleTools = () => setIsToolsOpen(!isToolsOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-[#0a0f1a]/95 backdrop-blur-md border-gray-800/50 shadow-md" : "bg-[#0a0f1a] border-gray-800",
      )}
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
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item, index) => (
              <div key={index} className="relative">
                {item.isDropdown ? (
                  <>
                    <button
                      ref={toolsButtonRef}
                      onClick={toggleTools}
                      className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                      aria-expanded={isToolsOpen}
                    >
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${item.badge.color}`}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "ml-1 h-4 w-4 transition-transform duration-200",
                          isToolsOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isToolsOpen && (
                        <motion.div
                          ref={dropdownRef}
                          className="absolute top-full right-0 mt-1 w-64 rounded-xl overflow-hidden bg-[#111827] border border-gray-700 shadow-xl"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            {item.items?.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                href={subItem.isAvailable ? subItem.href : "#"}
                                onClick={() => setIsToolsOpen(false)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                                  subItem.isAvailable
                                    ? "text-white hover:bg-white/10"
                                    : "text-gray-400 cursor-not-allowed",
                                )}
                              >
                                <div className="flex items-center">
                                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-[#1a2235]">
                                    {subItem.icon}
                                  </span>
                                  <span className="ml-3 font-medium">{subItem.name}</span>
                                </div>
                                {subItem.badge && (
                                  <Badge className={`${subItem.badge.color} text-white border-0`}>
                                    {subItem.badge.text}
                                  </Badge>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                  >
                    <span className="font-medium">{item.name}</span>
                    {item.isExternal && <ExternalLink className="ml-1 h-3.5 w-3.5" />}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/signup">Get Started</Link>
              </motion.div>
            </Button>
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
              <nav className="flex flex-col space-y-1">
                {navItems.map((item, index) => (
                  <div key={index}>
                    {item.isDropdown ? (
                      <div className="border-b border-gray-800 pb-2 mb-2">
                        <button
                          onClick={() => setIsToolsOpen(!isToolsOpen)}
                          className="flex items-center justify-between w-full px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white ${item.badge.color}`}
                              >
                                {item.badge.text}
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform duration-200", isToolsOpen ? "rotate-180" : "")}
                          />
                        </button>
                        <AnimatePresence>
                          {isToolsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-1 pl-4 border-l border-gray-800 ml-3"
                            >
                              {item.items?.map((subItem, subIndex) => (
                                <Link
                                  key={subIndex}
                                  href={subItem.isAvailable ? subItem.href : "#"}
                                  onClick={closeMenu}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                                    subItem.isAvailable
                                      ? "text-white hover:bg-white/10"
                                      : "text-gray-400 cursor-not-allowed",
                                  )}
                                >
                                  <div className="flex items-center">
                                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#1a2235]">
                                      {subItem.icon}
                                    </span>
                                    <span className="ml-3 font-medium">{subItem.name}</span>
                                  </div>
                                  {subItem.badge && (
                                    <Badge className={`${subItem.badge.color} text-white border-0`}>
                                      {subItem.badge.text}
                                    </Badge>
                                  )}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        rel={item.isExternal ? "noopener noreferrer" : undefined}
                        onClick={closeMenu}
                        className="flex items-center px-3 py-2.5 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/5"
                      >
                        <span className="font-medium">{item.name}</span>
                        {item.isExternal && <ExternalLink className="ml-1 h-3.5 w-3.5" />}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#16783a] to-[#45c133] hover:from-[#16783a]/90 hover:to-[#45c133]/90 text-white"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
