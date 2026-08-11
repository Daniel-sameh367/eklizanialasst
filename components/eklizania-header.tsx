import Image from "next/image"

export function EklizaniaHeader() {
  return (
    <header className="flex items-center justify-center bg-background px-4 py-3">
      <Image
        src="/images/eklizania-logo-trimmed.png"
        alt="Eklizania"
        width={846}
        height={396}
        priority
        className="h-14 w-auto object-contain sm:h-20"
      />
    </header>
  )
}
