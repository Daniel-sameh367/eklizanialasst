import { EklizaniaHeader } from "@/components/eklizania-header"
import { EklizaniaMap } from "@/components/eklizania-map"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <EklizaniaHeader />
      <EklizaniaMap />
    </main>
  )
}
