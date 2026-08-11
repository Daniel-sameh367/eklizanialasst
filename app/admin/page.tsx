"use client"

import { useEffect, useState } from "react"
import { AdminLoginForm } from "@/components/admin-login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Spinner } from "@/components/ui/spinner"

export default function AdminPage() {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">(
    "checking"
  )

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setStatus(data.authenticated ? "authenticated" : "unauthenticated"))
      .catch(() => setStatus("unauthenticated"))
  }, [])

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (status === "authenticated") {
    return <AdminDashboard onLoggedOut={() => setStatus("unauthenticated")} />
  }

  return <AdminLoginForm onSuccess={() => setStatus("authenticated")} />
}
