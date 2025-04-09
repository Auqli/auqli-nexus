import { Heart } from "lucide-react"

export function SimpleFooter() {
  return (
    <div className="py-4 text-center text-gray-500 text-sm border-t border-gray-800 mt-8">
      <div className="flex items-center justify-center">
        Made with <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> by Auqli
      </div>
    </div>
  )
}
