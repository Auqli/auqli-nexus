import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-1">
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
            <p className="text-gray-400 mb-6">Tools and resources to help Auqli sellers succeed with live commerce.</p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/auqli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/auqli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/auqli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/converter" className="text-gray-400 hover:text-white transition-colors">
                  CSV Converter
                </Link>
              </li>
              <li>
                <span className="text-gray-500 flex items-center">
                  AI Product Search
                  <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Soon</span>
                </span>
              </li>
              <li>
                <span className="text-gray-500 flex items-center">
                  AI Copywriting
                  <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">Soon</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.auqli.live/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://www.auqli.live/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="https://www.auqli.live/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Become a Seller
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.auqli.live/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="https://www.auqli.live/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://www.auqli.live/careers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Auqli. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:space-x-6">
            <a
              href="https://www.auqli.live/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.auqli.live/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://www.auqli.live/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
