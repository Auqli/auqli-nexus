import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E1117] p-4">
      <div className="max-w-md w-full bg-[#1A1D24] rounded-xl p-8 border border-gray-800 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">Please install the app from Shopify Admin.</p>
        <Link href="https://apps.shopify.com" target="_blank" rel="noopener noreferrer">
          <button className="bg-[#14B85F] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg transition-colors">
            Visit Shopify App Store
          </button>
        </Link>
      </div>
    </div>
  )
}
