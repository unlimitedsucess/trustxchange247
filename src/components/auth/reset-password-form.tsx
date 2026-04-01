"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2, CheckCircle2, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get("email")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!email || !token) {
      setErrorMessage("No recovery token found. Please request a new recovery link.")
    }
  }, [email, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" })
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      const res = await fetch("/api/user/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        toast({ title: "Success!", description: "Access restored. You can now login with your new password." })
        setTimeout(() => router.push("/login"), 3000)
      } else {
        setErrorMessage(data.message || "Failed to reset password.")
        toast({ title: "Security Halt", description: data.message || "Token invalid.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Network error", description: "Connection lost.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="p-8 shadow-2xl border-primary/10 bg-background/50 backdrop-blur-md">
        <AnimatePresence mode="wait">
          {errorMessage ? (
             <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-6">
                <div className="flex justify-center"><AlertCircle className="text-destructive h-12 w-12" /></div>
                <div className="space-y-2">
                   <h2 className="text-xl font-bold">Invalid Link</h2>
                   <p className="text-muted-foreground text-sm">{errorMessage}</p>
                </div>
                <Button asChild variant="outline" className="w-full font-bold">
                    <Link href="/forgot-password">Request New Recovery</Link>
                </Button>
             </motion.div>
          ) : success ? (
            <motion.div key="done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 space-y-6">
              <div className="bg-success p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-xl shadow-success/30">
                 <ShieldCheck className="text-white h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Security Restored</h2>
                <p className="text-muted-foreground font-medium">Redirecting you to the portal...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black tracking-tighter">Choose New Password</h1>
                  <p className="text-muted-foreground text-sm">Account recovery for <b>{email}</b></p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-tighter">Secure New Password</Label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       <Input
                         type={showPassword ? "text" : "password"}
                         className="pl-10 pr-10 h-12 bg-muted/40 font-bold"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         minLength={8}
                         placeholder="••••••••"
                       />
                       <button
                         type="button"
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-tighter">Retype to Confirm</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="h-12 bg-muted/40 font-bold pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                      <button
                         type="button"
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       >
                         {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-md font-black shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Authorize Password Change"}
                  </Button>
               </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
