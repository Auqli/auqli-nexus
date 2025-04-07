import Image from "next/image"

export function AuqliLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/images/auqli-logo.png" alt="Auqli Logo" width={120} height={40} className="h-auto" />
    </div>
  )
}

export function AuqliSymbol() {
  return (
    <div className="flex items-center justify-center">
      <Image src="/images/auqli-symbol.png" alt="Auqli Symbol" width={60} height={40} className="h-auto" />
    </div>
  )
}

