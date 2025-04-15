"use client"

import Link from "next/link"

// Footer link type
interface FooterLink {
  label: string
  href: string
  isExternal?: boolean
}

// Legal links
const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "About", href: "https://auqli.live/about", isExternal: true },
  { label: "Careers", href: "https://auqli.live/careers", isExternal: true },
  { label: "Blog", href: "https://auqli.live/blog", isExternal: true },
]

export function SiteFooter() {
  return (
    <footer className="bg-[#0a0f1a] text-white border-t border-gray-800">
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
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noopener noreferrer" : undefined}
                className="text-gray-500 hover:text-white text-sm transition-colors hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
