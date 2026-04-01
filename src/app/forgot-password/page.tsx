"use client"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full">
           <ForgotPasswordForm />
        </div>
      </main>
    </div>
  )
}
