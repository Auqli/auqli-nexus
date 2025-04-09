"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Twitter, Instagram, Linkedin, Sparkles } from "lucide-react"

// Footer link type
interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
  badge?: string
}

// Footer column type
interface FooterColumn {
  title: string
  links: FooterLink[]
}

// Footer data
const footerColumns: FooterColumn[] = [
  {
    title: "Tools",
    links: [
      { label: "AI CopyGen", href: "/copywriting", badge: "AI" },
      { label: "CSV Converter", href: "/converter" },
      { label: "AI Product Search", href: "/product-search", badge: "Soon" },
      { label: "AI ImageGen", href: "/imagegen", badge: "AI" },
      { label: "AI SocialGen", href: "/socialgen", badge: "Soon" },
      { label: "Auqli NexChat", href: "/nexchat", badge: "Soon" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "https://auqli.live/blog", isExternal: true },
      { label: "Help Center", href: "/help-center" },
      { label: "Become a Seller", href: "https://join.auqli.live/waitlist", isExternal: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
]

// Legal links
const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/cookie-policy" },
]

// Social links
const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com/auqli", label: "Twitter" },
  { icon: <Instagram className="h-5 w-5" />, href: "https://www.instagram.com/auqli", label: "Instagram" },
  { icon: <Linkedin className="h-5 w-5" />, href: "https://www.linkedin.com/company/auqli", label: "LinkedIn" },
]

export function SiteFooter() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <footer className="bg-gradient-to-b from-[#0a0f1a] to-[#111827] text-white border-t border-gray-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Brand Column */}
          <motion.div className="lg:col-span-3 md:col-span-1" variants={itemVariants}>
            <Link href="/" className="flex items-center mb-6">
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
            <div className="relative">
              <p className="text-gray-400 mb-6 max-w-xs">
                Your suite of AI-powered tools to create faster, sell smarter, and grow effortlessly.
              </p>
              <div className="absolute -top-1 -right-1">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="flex items-center justify-center"
                >
                  <span className="flex items-center text-xs font-medium text-[#45c133] bg-[#16783a]/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Columns */}
          <div className="lg:col-span-9 md:col-span-1 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {footerColumns.map((column, index) => (
              <motion.div key={index} variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-4 text-white">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                        className="text-gray-400 hover:text-white transition-colors group flex items-center"
                      >
                        <span className="group-hover:underline">{link.label}</span>
                        {link.isExternal && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-1"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        )}
                        {link.badge && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Auqli Nexus. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-white text-sm transition-colors hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
