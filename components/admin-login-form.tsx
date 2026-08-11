"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError("Incorrect password")
        return
      }
      onSuccess()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border bg-card p-6"
      >
        <h1 className="mb-6 text-center text-lg font-semibold text-foreground">
          Eklizania Admin
        </h1>
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="admin-password">Password</FieldLabel>
            <Input
              id="admin-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              className="h-12 text-base"
            />
            <FieldError>{error}</FieldError>
          </Field>
          <Button type="submit" disabled={loading || !password} className="h-12 text-base">
            {loading && <Spinner data-icon="inline-start" />}
            Login
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
