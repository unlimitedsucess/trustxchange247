"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, Smartphone, Loader2, Menu, Eye, EyeOff } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function SecurityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
  const [pinData, setPinData] = useState({ newPin: "", confirmPin: "" })
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const token = useSelector((state: RootState) => state.token.token)
  const { toast } = useToast()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new !== passwordData.confirm) {
      return toast({ title: "Mismatch", description: "New passwords do not match", variant: "destructive" })
    }
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile/security", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "password", currentPassword: passwordData.current, newPassword: passwordData.new })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Password updated successfully" })
        setPasswordData({ current: "", new: "", confirm: "" })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pinData.newPin !== pinData.confirmPin) {
      return toast({ title: "Mismatch", description: "PINs do not match", variant: "destructive" })
    }
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile/security", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "pin", newPin: pinData.newPin })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Transaction PIN updated" })
        setPinData({ newPin: "", confirmPin: "" })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:relative w-64 h-full bg-sidebar z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-y-auto px-4 py-8 sm:p-12 space-y-12">
        <div className="flex items-center justify-between md:hidden mb-6">
           <span className="font-black text-xl tracking-tighter">TRUSTXCHANGE</span>
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu /></Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-primary h-8 w-8" />
                    Security Settings
                </h1>
                <p className="text-muted-foreground mt-2">Manage your authentication methods and transaction safety.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className="p-8 border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Account Password</h2>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="space-y-4 flex-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Current Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showCurrent ? "text" : "password"} 
                                        className="bg-background/30 pr-10" 
                                        value={passwordData.current} 
                                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showNew ? "text" : "password"} 
                                        className="bg-background/30 pr-10" 
                                        value={passwordData.new} 
                                        onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Confirm New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showConfirm ? "text" : "password"} 
                                        className="bg-background/30 pr-10" 
                                        value={passwordData.confirm} 
                                        onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4 mt-auto">
                                <Button type="submit" className="w-full font-bold" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="p-8 border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-accent/10 p-2 rounded-lg text-accent">
                                <Smartphone size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Transaction PIN</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mb-6">Your PIN is required for all withdrawal authorizations.</p>
                        <form onSubmit={handleUpdatePin} className="space-y-4 flex-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">New 4-6 Digit PIN</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPin ? "text" : "password"} 
                                        maxLength={6}
                                        placeholder="••••"
                                        className="bg-background/30 text-center tracking-[1em] text-lg font-black pr-10" 
                                        value={pinData.newPin} 
                                        onChange={(e) => setPinData({...pinData, newPin: e.target.value})}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Confirm PIN</Label>
                                <div className="relative">
                                    <Input 
                                        type={showConfirmPin ? "text" : "password"} 
                                        maxLength={6}
                                        placeholder="••••"
                                        className="bg-background/30 text-center tracking-[1em] text-lg font-black pr-10" 
                                        value={pinData.confirmPin} 
                                        onChange={(e) => setPinData({...pinData, confirmPin: e.target.value})}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4 mt-auto">
                                <Button type="submit" variant="secondary" className="w-full font-bold" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Update PIN"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
      </main>
    </div>
  )
}
