"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export function SiteHeader() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <header className="bg-[#0a0f1a] border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
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

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link href="/about" className="text-white hover:text-gray-300 text-sm font-medium flex items-center">
              About
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            <Link href="/blog" className="text-white hover:text-gray-300 text-sm font-medium flex items-center">
              Blog
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>

            <Link href="/pricing" className="text-white hover:text-gray-300 text-sm font-medium">
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300">
                  Hi, {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}!
                </span>
                <Link href="/dashboard">
                  <Button className="bg-transparent border border-gray-600 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    className="border-gray-600 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
