"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Loader2 } from "lucide-react"

interface UserEditModalProps {
  user: {
    id: string | number
    name: string
    email: string
    country: string
    status: "Active" | "Suspended"
    transactionPin?: string
    kycStatus: string
    idDocument?: string
    selfieDocument?: string
    totalBalance?: number
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const [formData, setFormData] = useState(
    user ? { ...user, password: "", totalBalance: user.totalBalance ?? "" } : { id: "", name: "", email: "", country: "", status: "Active", password: "", transactionPin: "", kycStatus: "unverified", totalBalance: "" },
  )
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Custom dialog states instead of window alerts
  const [recordToDelete, setRecordToDelete] = useState<{ typeCategory: string; recordId: string } | null>(null)
  const [recordToEdit, setRecordToEdit] = useState<{ typeCategory: string; recordId: string; amount: string } | null>(null)
  
  const { toast } = useToast()
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "", totalBalance: user.totalBalance ?? "" })
      fetchHistory(user.id)
    }
  }, [user])

  const fetchHistory = async (userId: string | number) => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/admin/users/${userId}/history`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
         setHistory(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as "Active" | "Suspended" }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.country) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload: any = {
        fullName: formData.name,
        email: formData.email,
        country: formData.country,
        status: formData.status,
        transactionPin: formData.transactionPin || "",
        kycStatus: formData.kycStatus
      }
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password
      }
      if (formData.totalBalance !== "") {
        payload.totalBalance = Number(formData.totalBalance)
      } else {
        payload.totalBalance = null // Clear it
      }

      const res = await fetch(`/api/admin/users/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      toast({ title: "Success", description: `User ${formData.name} details updated successfully` })
      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/users/${formData.id}/history?typeCategory=${recordToDelete.typeCategory}&recordId=${recordToDelete.recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete record");
      toast({ title: "Success", description: "Record deleted successfully" });
      setRecordToDelete(null);
      fetchHistory(formData.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteRecord = (typeCategory: string, recordId: string) => {
    setRecordToDelete({ typeCategory, recordId });
  }

  const confirmEditRecord = async () => {
    if (!recordToEdit) return;
    const newAmount = Number(recordToEdit.amount);
    if (isNaN(newAmount)) {
       toast({ title: "Validation Error", description: "Invalid amount", variant: "destructive" });
       return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/users/${formData.id}/history`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ typeCategory: recordToEdit.typeCategory, recordId: recordToEdit.recordId, amount: newAmount })
      });
      if (!res.ok) throw new Error("Failed to update record");
      toast({ title: "Success", description: "Record updated successfully" });
      setRecordToEdit(null);
      fetchHistory(formData.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditRecord = (typeCategory: string, recordId: string, currentAmount: number) => {
    setRecordToEdit({ typeCategory, recordId, amount: String(currentAmount) });
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>Update account information and security settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="transactionPin">Transaction PIN</Label>
                <Input id="transactionPin" name="transactionPin" value={formData.transactionPin || ""} onChange={handleChange} placeholder="Security PIN" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="kycStatus">KYC Status</Label>
                <Select value={formData.kycStatus} onValueChange={(v) => setFormData(p => ({...p, kycStatus: v}))}>
                    <SelectTrigger id="kycStatus"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unverified">Unverified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="totalBalance">Total Balance Override (Optional)</Label>
            <Input id="totalBalance" name="totalBalance" type="number" value={formData.totalBalance} onChange={handleChange} placeholder="e.g. 5000" />
            <p className="text-xs text-muted-foreground">Setting this explicitly overrides any dynamically calculated balance.</p>
          </div>

          {(user?.idDocument || user?.selfieDocument) && (
             <div className="space-y-2 border-t pt-4">
                <Label>Submitted KYC Documents</Label>
                <div className="grid grid-cols-2 gap-4">
                   {user.idDocument && (
                      <div className="flex flex-col gap-1">
                         <span className="text-xs text-muted-foreground font-medium">ID Document</span>
                         <a href={user.idDocument} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-md border aspect-video block bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.idDocument} alt="ID Document" className="w-full h-full object-cover hover:scale-105 transition" />
                         </a>
                      </div>
                   )}
                   {user.selfieDocument && (
                      <div className="flex flex-col gap-1">
                         <span className="text-xs text-muted-foreground font-medium">Selfie Verification</span>
                         <a href={user.selfieDocument} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-md border aspect-video block bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.selfieDocument} alt="Selfie" className="w-full h-full object-cover hover:scale-105 transition" />
                         </a>
                      </div>
                   )}
                </div>
             </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="password">Reset Password (Optional)</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="New password" />
          </div>

          <div className="space-y-3 border-t pt-4 mt-4 bg-muted/20 p-4 rounded-md">
            <Label className="font-bold flex justify-between items-center">
              <span>Transaction & ROI History</span>
            </Label>
            {loadingHistory ? (
              <p className="text-xs text-muted-foreground">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted-foreground border p-4 text-center rounded bg-background">No history found for this user.</p>
            ) : (
               <div className="max-h-60 overflow-y-auto border rounded-md">
                 <table className="w-full text-xs text-left">
                   <thead className="bg-muted sticky top-0">
                     <tr>
                       <th className="p-2 font-medium">Type</th>
                       <th className="p-2 font-medium">Amount</th>
                       <th className="p-2 font-medium">Date</th>
                       <th className="p-2 font-medium text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {history.map((record) => (
                       <tr key={record._id} className="hover:bg-muted/50 transition-colors bg-background">
                         <td className="p-2 capitalize">{record.typeCategory} {record.type === 'bonus' ? '(Bonus)' : ''}</td>
                         <td className="p-2 font-medium">${Number(record.amount || 0).toFixed(2)}</td>
                         <td className="p-2 text-muted-foreground">{new Date(record.displayDate).toLocaleDateString()}</td>
                         <td className="p-2 text-right">
                           <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-primary" onClick={() => handleEditRecord(record.typeCategory, record._id, record.amount)}>
                             Edit
                           </Button>
                           <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-destructive" onClick={() => handleDeleteRecord(record.typeCategory, record._id)}>
                             Delete
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2 w-full sm:w-auto">
            {isLoading ? "Saving..." : "Update Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this {recordToDelete?.typeCategory}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRecordToDelete(null)} disabled={isLoading} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteRecord} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!recordToEdit} onOpenChange={(open) => !open && setRecordToEdit(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="capitalize">Edit {recordToEdit?.typeCategory} Amount</DialogTitle>
            <DialogDescription>
              Enter the new amount for this transaction below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editAmount">New Amount</Label>
            <Input 
               id="editAmount" 
               type="number" 
               value={recordToEdit?.amount || ""} 
               onChange={(e) => setRecordToEdit(prev => prev ? { ...prev, amount: e.target.value } : null)} 
               placeholder="0.00" 
               className="mt-2"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRecordToEdit(null)} disabled={isLoading} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={confirmEditRecord} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
