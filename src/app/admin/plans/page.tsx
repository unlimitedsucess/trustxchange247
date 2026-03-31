"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

export default function AdminPlansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", minInvestment: "", maxInvestment: "", dailyRoi: "", monthlyRoi: "", durationDays: "", isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/admin/plans", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setPlans(data.data)
        }
      } catch (err) {
        console.error("Failed to fetch plans", err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchPlans()
  }, [token])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        minInvestment: Number(formData.minInvestment),
        maxInvestment: Number(formData.maxInvestment),
        dailyRoi: Number(formData.dailyRoi),
        monthlyRoi: Number(formData.monthlyRoi) || (Number(formData.dailyRoi) * 30),
        durationDays: Number(formData.durationDays),
        isActive: formData.isActive
      };
      
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlans([data.data, ...plans]);
        setCreateModalOpen(false);
        setFormData({ name: "", minInvestment: "", maxInvestment: "", dailyRoi: "", monthlyRoi: "", durationDays: "", isActive: true });
      }
    } catch (err) {
      console.error("Failed to create plan", err);
    } finally {
      setSubmitting(false);
    }
  }

  const openEditModal = (plan: any) => {
    setSelectedPlanId(plan._id);
    setFormData({
      name: plan.name,
      minInvestment: plan.minInvestment.toString(),
      maxInvestment: plan.maxInvestment.toString(),
      dailyRoi: plan.dailyRoi.toString(),
      monthlyRoi: plan.monthlyRoi.toString(),
      durationDays: plan.durationDays.toString(),
      isActive: plan.isActive
    });
    setEditModalOpen(true);
  }

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        minInvestment: Number(formData.minInvestment),
        maxInvestment: Number(formData.maxInvestment),
        dailyRoi: Number(formData.dailyRoi),
        monthlyRoi: Number(formData.monthlyRoi) || (Number(formData.dailyRoi) * 30),
        durationDays: Number(formData.durationDays),
        isActive: formData.isActive
      };
      
      const res = await fetch(`/api/admin/plans/${selectedPlanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlans(plans.map(p => p._id === selectedPlanId ? data.data : p));
        setEditModalOpen(false);
        setFormData({ name: "", minInvestment: "", maxInvestment: "", dailyRoi: "", monthlyRoi: "", durationDays: "", isActive: true });
        setSelectedPlanId(null);
      }
    } catch (err) {
      console.error("Failed to update plan", err);
    } finally {
      setSubmitting(false);
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
              <span className="text-foreground font-semibold">Admin</span> / Investment Plans
            </div>

            <Card className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Investment Plans Management</h2>
                  <Button size="sm" onClick={() => setCreateModalOpen(true)}>Create Plan</Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Min ($)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Max ($)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Daily ROI (%)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Duration (Days)</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center">Loading plans...</td>
                        </tr>
                      ) : plans.length > 0 ? (
                        plans.map((plan) => (
                          <tr key={plan._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-4 text-sm font-semibold">{plan.name}</td>
                            <td className="px-4 py-4 text-right text-sm">{plan.minInvestment}</td>
                            <td className="px-4 py-4 text-right text-sm">{plan.maxInvestment}</td>
                            <td className="px-4 py-4 text-right text-sm">{plan.dailyRoi}</td>
                            <td className="px-4 py-4 text-right text-sm">{plan.durationDays}</td>
                            <td className="px-4 py-4 text-center text-sm">{plan.isActive ? "Active" : "Inactive"}</td>
                            <td className="px-4 py-4 text-center text-sm">
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(plan)}>Edit</Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No plans found. Create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 w-full max-w-md bg-card">
            <h3 className="text-lg font-bold mb-4">Create Investment Plan</h3>
            <form onSubmit={handleCreatePlan} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium">Plan Name</label>
                <select required className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}>
                  <option value="" disabled>Select a plan...</option>
                  <option value="Basic Plan">Basic Plan</option>
                  <option value="Silver Plan">Silver Plan</option>
                  <option value="Gold Plan">Gold Plan</option>
                  <option value="Long Term Plan">Long Term Plan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Investment ($)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.minInvestment} onChange={e => setFormData({...formData, minInvestment: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Investment ($)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.maxInvestment} onChange={e => setFormData({...formData, maxInvestment: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Daily ROI (%)</label>
                  <input required step="0.1" type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.dailyRoi} onChange={e => setFormData({...formData, dailyRoi: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActiveCreate" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4" />
                <label htmlFor="isActiveCreate" className="text-sm font-medium">Plan is Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Plan"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 w-full max-w-md bg-card">
            <h3 className="text-lg font-bold mb-4">Edit Investment Plan</h3>
            <form onSubmit={handleUpdatePlan} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium">Plan Name</label>
                <select required className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}>
                  <option value="" disabled>Select a plan...</option>
                  <option value="Basic Plan">Basic Plan</option>
                  <option value="Silver Plan">Silver Plan</option>
                  <option value="Gold Plan">Gold Plan</option>
                  <option value="Long Term Plan">Long Term Plan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Investment ($)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.minInvestment} onChange={e => setFormData({...formData, minInvestment: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Investment ($)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.maxInvestment} onChange={e => setFormData({...formData, maxInvestment: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Daily ROI (%)</label>
                  <input required step="0.1" type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.dailyRoi} onChange={e => setFormData({...formData, dailyRoi: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <input required type="number" className="w-full mt-1 p-2 border border-border rounded bg-background" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActiveEdit" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4" />
                <label htmlFor="isActiveEdit" className="text-sm font-medium">Plan is Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Updating..." : "Update Plan"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
