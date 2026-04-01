"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/user/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() })
      })

      if (res.ok) {
        setSuccess(true)
        toast({ title: "Email Sent", description: "Please check your inbox for recovery instructions." })
      } else {
        const data = await res.json()
        toast({ title: "Error", description: data.message || "Something went wrong", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Connection Error", description: "Failed to communicate with security nodes.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 shadow-2xl border-primary/10 bg-background/50 backdrop-blur-md">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="request"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight">Recovery Access</h1>
                <p className="text-muted-foreground text-sm">Enter your registered email to receive a secure recovery link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Authorized Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="investor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-muted/30 border-primary/10 focus:border-primary/40 transition-all font-medium"
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-md font-bold gap-2 group shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                      Distribute Link <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-sm font-bold text-primary flex items-center justify-center gap-1 hover:gap-2 transition-all">
                  <ArrowLeft size={14} /> Back to standard login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="flex justify-center">
                 <div className="bg-success/10 p-4 rounded-full">
                    <CheckCircle2 size={48} className="text-success animate-bounce" />
                 </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Email Dispatched</h2>
                <p className="text-muted-foreground text-sm px-4">
                  Security protocols have sent a recovery token to <b>{email}</b>. Link expires in 60 minutes.
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center gap-2 border border-primary/5">
                 <span className="text-[10px] uppercase font-bold text-muted-foreground">Didn't receive it?</span>
                 <Button variant="link" size="sm" onClick={() => setSuccess(false)} className="text-[10px] font-black underline p-0 h-auto">TRY AGAIN</Button>
              </div>
              <Button asChild variant="outline" className="w-full font-bold border-primary/20 hover:bg-primary/5">
                <Link href="/login">Return to Portal</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
