import Link from "next/link"
import { Heart } from "lucide-react"

export function AuqliToolsFooter() {
  return (
    <div className="py-4 text-center text-gray-500 text-sm border-t border-gray-800">
      <div className="flex items-center justify-center">
        Made with <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> by Auqli
        <Link href="https://auqli.live" target="_blank" rel="noopener noreferrer" className="ml-2 hover:underline">
          auqli.live
        </Link>
      </div>
    </div>
  )
}
