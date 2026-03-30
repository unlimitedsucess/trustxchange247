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
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

interface UserEditModalProps {
  user: {
    id: number
    name: string
    email: string
    deposit: string
    withdrawal: string
    status: "Active" | "Suspended"
    transactionPin?: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const [formData, setFormData] = useState(
    user ? { ...user, password: "" } : { id: 0, name: "", email: "", country: "", deposit: "", withdrawal: "", status: "Active", password: "", transactionPin: "" },
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" })
    }
  }, [user])

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
        transactionPin: formData.transactionPin || ""
      }
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password
      }

      const res = await fetch(`/api/admin/users/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: "Success", description: `User ${formData.name} updated successfully` })
        onOpenChange(false)
        window.location.reload()
      } else {
        const errorData = await res.json()
        toast({ title: "Error", description: errorData.message || "Failed to update user", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionPin">Transaction PIN</Label>
            <Input
              id="transactionPin"
              name="transactionPin"
              type="text"
              value={formData.transactionPin || ""}
              onChange={handleChange}
              placeholder="e.g. 1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Set New User Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
