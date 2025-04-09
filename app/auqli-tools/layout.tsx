"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  ImageIcon,
  FileText,
  BookOpen,
  User,
  LifeBuoy,
  CreditCard,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  PenToolIcon as Tool,
} from "lucide-react"
import { AuqliToolsHeader } from "./components/auqli-tools-header"
import { SimpleFooter } from "./components/simple-footer"

export default function AuqliToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isToolsOpen, setIsToolsOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    // Close mobile menu when path changes
    setIsMobileMenuOpen(false)
  }, [pathname])

  const isActive = (path: string) => pathname === path

  const navItems = [
    {
      name: "Dashboard",
      href: "/auqli-tools",
      icon: Home,
    },
    {
      name: "Tools",
      icon: Tool,
      isDropdown: true,
      isOpen: isToolsOpen,
      toggle: () => setIsToolsOpen(!isToolsOpen),
      items: [
        {
          name: "ImageGen AI",
          href: "/auqli-tools/imagegen",
          icon: ImageIcon,
        },
        {
          name: "CopyGen AI",
          href: "/auqli-tools/copygen-ai",
          icon: FileText,
        },
        {
          name: "BlogGen AI",
          href: "/auqli-tools/bloggen-ai",
          icon: BookOpen,
          isFuture: true,
        },
      ],
    },
    {
      name: "Account",
      href: "/auqli-tools/account",
      icon: User,
    },
    {
      name: "Support",
      href: "/auqli-tools/support",
      icon: LifeBuoy,
    },
    {
      name: "Billing",
      href: "/auqli-tools/billing",
      icon: CreditCard,
      isFuture: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0E1117] text-white flex">
      {/* Mobile menu toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-[#1A1D24] text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex flex-col w-64 bg-[#1A1D24] border-r border-gray-800 p-4 h-screen sticky top-0`}>
        <div className="flex items-center justify-center mb-8 mt-2">
          <Link href="/auqli-tools">
            <div className="text-xl font-bold text-white flex items-center">
              <span className="text-[#14B85F]">Auqli</span>
              <span className="ml-1">Nexus</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.isDropdown ? (
                <div className="space-y-1">
                  <button
                    onClick={item.toggle}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      item.items?.some((subItem) => isActive(subItem.href))
                        ? "bg-[#14B85F]/10 text-[#14B85F]"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </div>
                    {item.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <AnimatePresence>
                    {item.isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 pl-3 border-l border-gray-700 space-y-1 overflow-hidden"
                      >
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.isFuture ? "#" : subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive(subItem.href)
                                ? "bg-[#14B85F]/10 text-[#14B85F]"
                                : "text-gray-300 hover:bg-gray-800"
                            } ${subItem.isFuture ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <subItem.icon className="h-4 w-4 mr-3" />
                            <span>{subItem.name}</span>
                            {subItem.isFuture && (
                              <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">Soon</span>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.isFuture ? "#" : item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href) ? "bg-[#14B85F]/10 text-[#14B85F]" : "text-gray-300 hover:bg-gray-800"
                  } ${item.isFuture ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                  {item.isFuture && <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">Soon</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="pt-4 mt-6 border-t border-gray-800">
          <button className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 w-full">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-64 max-w-xs bg-[#1A1D24] p-4 h-full">
              <div className="flex items-center justify-center mb-8 mt-2">
                <Link href="/auqli-tools" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="text-xl font-bold text-white flex items-center">
                    <span className="text-[#14B85F]">Auqli</span>
                    <span className="ml-1">Nexus</span>
                  </div>
                </Link>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.isDropdown ? (
                      <div className="space-y-1">
                        <button
                          onClick={item.toggle}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                            item.items?.some((subItem) => isActive(subItem.href))
                              ? "bg-[#14B85F]/10 text-[#14B85F]"
                              : "text-gray-300 hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                          </div>
                          {item.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        <AnimatePresence>
                          {item.isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 pl-3 border-l border-gray-700 space-y-1 overflow-hidden"
                            >
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.isFuture ? "#" : subItem.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                                    isActive(subItem.href)
                                      ? "bg-[#14B85F]/10 text-[#14B85F]"
                                      : "text-gray-300 hover:bg-gray-800"
                                  } ${subItem.isFuture ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                  <subItem.icon className="h-4 w-4 mr-3" />
                                  <span>{subItem.name}</span>
                                  {subItem.isFuture && (
                                    <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">Soon</span>
                                  )}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.isFuture ? "#" : item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href) ? "bg-[#14B85F]/10 text-[#14B85F]" : "text-gray-300 hover:bg-gray-800"
                        } ${item.isFuture ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                        {item.isFuture && (
                          <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">Soon</span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              <div className="pt-4 mt-6 border-t border-gray-800">
                <button className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 w-full">
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <AuqliToolsHeader />
        {children}
        <SimpleFooter />
      </div>
    </div>
  )
}
