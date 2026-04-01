"use client"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

function ResetLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Initializing Secure Reset Window...</p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full">
           <Suspense fallback={<ResetLoading />}>
              <ResetPasswordForm />
           </Suspense>
        </div>
      </main>
    </div>
  )
}
