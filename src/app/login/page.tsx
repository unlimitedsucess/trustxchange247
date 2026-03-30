"use client"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full bg-muted/30">
        <div className="max-w-md w-full mx-auto px-4 py-12">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
