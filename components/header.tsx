"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ChevronDown } from "lucide-react"

export default function Header() {
  const [toolsOpen, setToolsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const tools = [
    {
      name: "CSV Converter",
      description: "Convert and prepare product CSVs for bulk uploads",
      color: "bg-emerald-500",
      href: "/tools/csv-converter",
      comingSoon: false,
    },
    {
      name: "ImageGen AI",
      description: "Generate high-quality product photos and visuals",
      color: "bg-purple-500",
      href: "/tools/image-gen",
      comingSoon: false,
    },
    {
      name: "CopyGen AI",
      description: "Create powerful product titles and descriptions",
      color: "bg-blue-500",
      href: "/tools/copy-gen",
      comingSoon: false,
    },
    {
      name: "BlogGen AI",
      description: "Generate SEO-optimized blog articles",
      color: "bg-amber-500",
      href: "/tools/blog-gen",
      comingSoon: false,
    },
    {
      name: "CaptionGen AI",
      description: "Auto-generate subtitles for videos in multiple languages",
      color: "bg-orange-500",
      href: "/tools/caption-gen",
      comingSoon: true,
    },
    {
      name: "VoiceBlog AI",
      description: "Turn voice notes into full blog posts",
      color: "bg-red-500",
      href: "/tools/voice-blog",
      comingSoon: true,
    },
    {
      name: "ClipSlash AI",
      description: "Cut long videos into viral clips automatically",
      color: "bg-red-500",
      href: "/tools/clip-slash",
      comingSoon: true,
    },
    {
      name: "IdeaSpark AI",
      description: "Generate video ideas, hooks, and shot lists",
      color: "bg-amber-500",
      href: "/tools/idea-spark",
      comingSoon: true,
    },
    {
      name: "CVBoost AI",
      description: "Optimize your CV and generate cover letters",
      color: "bg-purple-500",
      href: "/tools/cv-boost",
      comingSoon: true,
    },
    {
      name: "ThreadGen AI",
      description: "Convert content into Twitter/X threads",
      color: "bg-blue-500",
      href: "/tools/thread-gen",
      comingSoon: true,
    },
    {
      name: "FlexGen AI",
      description: "Generate WhatsApp bios and matching profile pics",
      color: "bg-red-500",
      href: "/tools/flex-gen",
      comingSoon: true,
    },
  ]

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

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className="text-white hover:text-gray-300 text-sm font-medium flex items-center"
              >
                Tools
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {toolsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0a0f1a] border border-gray-800 rounded-md shadow-lg z-50 py-2 max-h-[80vh] overflow-y-auto">
                  <div className="absolute right-0 top-0 mr-4 mt-2 cursor-pointer text-gray-400 hover:text-white">
                    <svg
                      onClick={() => setToolsOpen(false)}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>

                  <div className="pt-4">
                    {tools.map((tool, index) => (
                      <Link
                        key={index}
                        href={tool.comingSoon ? "#" : tool.href}
                        className="block px-4 py-2 hover:bg-gray-800 transition-colors duration-150"
                        onClick={() => {
                          if (!tool.comingSoon) {
                            setToolsOpen(false)
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`${tool.color} rounded-full p-2 mr-3 mt-1`}>
                            <div className="w-4 h-4"></div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-white font-medium">{tool.name}</span>
                              {tool.comingSoon && (
                                <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-0.5">{tool.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-transparent border border-gray-600 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="bg-transparent border border-gray-600 hover:border-gray-500 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
