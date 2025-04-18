"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FileText,
  ImageIcon,
  BookOpen,
  Home,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  User,
  Loader2,
  MessageSquare,
  Scissors,
  Lightbulb,
  FileTextIcon as FileText2,
  Share2,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  isAvailable?: boolean
}

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClientComponentClient()
  const { signOut } = useAuth()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      isAvailable: true,
    },
    {
      title: "CSV Converter",
      href: "/converter",
      icon: FileText,
      isAvailable: true,
    },
    {
      title: "CopyGen AI",
      href: "/copygen",
      icon: FileText,
      isAvailable: false,
    },
    {
      title: "ImageGen AI",
      href: "/imagegen",
      icon: ImageIcon,
      isAvailable: false,
    },
    {
      title: "BlogGen AI",
      href: "/bloggen",
      icon: BookOpen,
      isAvailable: false,
    },
    {
      title: "CaptionGen AI",
      href: "/captiongen",
      icon: MessageSquare,
      isAvailable: false,
    },
    {
      title: "ClipSlash AI",
      href: "/clipslash",
      icon: Scissors,
      isAvailable: false,
    },
    {
      title: "IdeaSpark AI",
      href: "/ideaspark",
      icon: Lightbulb,
      isAvailable: false,
    },
    {
      title: "CVBoost AI",
      href: "/cvboost",
      icon: FileText2,
      isAvailable: false,
    },
    {
      title: "ThreadGen AI",
      href: "/threadgen",
      icon: Share2,
      isAvailable: false,
    },
    {
      title: "Account",
      href: "/dashboard/account",
      icon: User,
      isAvailable: true,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      isAvailable: true,
    },
  ]

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {isSigningOut && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1A1D24] p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-white text-lg font-medium">Signing you out...</p>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="bg-[#1A1D24] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)}></div>
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-16 left-0 z-40 h-screen bg-[#1A1D24] border-r border-gray-800 transition-all duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            } px-4 py-5 border-b border-gray-800`}
          >
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-semibold text-white">Auqli Nexus</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className={`text-gray-400 hover:text-white transition-colors ${isCollapsed ? "hidden lg:block" : ""}`}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const href = item.href
                const isActive = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.isAvailable ? href : "#"}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center" : "justify-between"
                      } px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                      } ${!item.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={(e) => !item.isAvailable && e.preventDefault()}
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {!isCollapsed && !item.isAvailable && (
                        <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
                      )}
                    </Link>
                  </li>
                )
              })}
              <li>
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } px-3 py-2.5 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-lg transition-colors`}
                >
                  <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Sign out</span>}
                </button>
              </li>
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-gray-800">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/account"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } px-3 py-2.5 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-lg transition-colors`}
                >
                  <User className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Account</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } px-3 py-2.5 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-lg transition-colors`}
                >
                  <Settings className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Settings</span>}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } px-3 py-2.5 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-lg transition-colors`}
                >
                  <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                  {!isCollapsed && <span>Sign out</span>}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
