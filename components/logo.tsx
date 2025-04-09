import Image from "next/image"

export function AuqliLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MARK-rlaHxgk2H2Z1pLvKYo7HsSBa801gp4.png"
        alt="Auqli Logo"
        width={40}
        height={40}
        className="h-10 w-auto"
        priority
      />
      <span className="text-xl font-semibold text-white">Auqli Nexus</span>
    </div>
  )
}

export function AuqliSymbol() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MARK-rlaHxgk2H2Z1pLvKYo7HsSBa801gp4.png"
        alt="Auqli Logo"
        width={36}
        height={36}
        className="h-9 w-auto"
        priority
      />
    </div>
  )
}
