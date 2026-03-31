"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Menu, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    btcWallet: "",
    ethWallet: "",
    usdtWalletTRC20: ""
  })

  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data) {
          setSettings({
            btcWallet: data.data.btcWallet || "",
            ethWallet: data.data.ethWallet || "",
            usdtWalletTRC20: data.data.usdtWalletTRC20 || ""
          })
        }
      } catch (err) {
        console.error("Failed to fetch settings", err)
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchSettings()
  }, [token])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Settings saved successfully")
      } else {
        toast.error(data.message || "Failed to save settings")
      }
    } catch (err) {
      console.error("Failed to save settings", err)
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-50 md:z-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
            <span className="font-semibold">Admin Panel</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 sm:p-8 bg-background">
            <div className="mb-8 text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">Admin</span> / Settings
            </div>

            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-10 text-center">Loading settings...</div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Deposit Wallets</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="btcWallet">Bitcoin (BTC) Wallet Address</Label>
                          <Input
                            id="btcWallet"
                            value={settings.btcWallet}
                            onChange={(e) => setSettings({ ...settings, btcWallet: e.target.value })}
                            placeholder="Enter BTC Address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ethWallet">Ethereum (ETH) Wallet Address</Label>
                          <Input
                            id="ethWallet"
                            value={settings.ethWallet}
                            onChange={(e) => setSettings({ ...settings, ethWallet: e.target.value })}
                            placeholder="Enter ETH Address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="usdtWallet">USDT (TRC20) Wallet Address</Label>
                          <Input
                            id="usdtWallet"
                            value={settings.usdtWalletTRC20}
                            onChange={(e) => setSettings({ ...settings, usdtWalletTRC20: e.target.value })}
                            placeholder="Enter USDT TRC20 Address"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={saving} className="w-full gap-2">
                          {saving ? "Saving..." : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
