"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit2, MoreVertical } from "lucide-react"
import { UserEditModal } from "./user-edit-modal"
import { DepositModal } from "./deposit-modal"
import { WithdrawalModal } from "./withdrawal-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useToast } from "@/components/ui/use-toast"

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  deposit: string;
  withdrawal: string;
  status: "Active" | "Suspended";
  transactionPin?: string;
  totalBonus: number;
};

type UserStatus = "Active" | "Suspended"

const statusConfig: Record<
  UserStatus,
  { color: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  Active: { color: "bg-accent/10 text-accent", variant: "default" },
  Suspended: { color: "bg-destructive/10 text-destructive", variant: "destructive" },
}

export function AdminUsersTable() {
  const [usersData, setUsersData] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const token = useSelector((state: RootState) => state.token.token)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          const mappedUsers = data.data.map((u: any) => ({
            id: u._id,
            name: u.fullName || "N/A",
            email: u.email,
            country: u.country || "N/A",
            deposit: u.totalDeposits ? `$${u.totalDeposits.toLocaleString()}` : "$0",
            withdrawal: u.totalWithdrawals ? `$${u.totalWithdrawals.toLocaleString()}` : "$0",
            status: u.status || "Active",
            transactionPin: u.transactionPin || "",
            totalBonus: u.totalBonus || 0
          }))
          setUsersData(mappedUsers)
        }
      } catch (err) {
        console.error("Failed to fetch users", err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchUsers()
  }, [token])

  const itemsPerPage = 10
  const filteredData = usersData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleCreateDeposit = (user: AdminUser) => {
    setSelectedUser(user)
    setDepositModalOpen(true)
  }

  const handleCreateWithdrawal = (user: AdminUser) => {
    setSelectedUser(user)
    setWithdrawalModalOpen(true)
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to permanently delete user: ${user.name}?`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Success", description: "User deleted successfully" })
        setUsersData(usersData.filter(u => u.id !== user.id))
      } else {
        toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" })
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Users Management</h2>
            <Button size="sm">Create User</Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-11"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Country</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Total Deposit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Total Withdrawal</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0">
                      <td className="px-4 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      <td className="px-4 py-4 flex items-center justify-center gap-2"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></td>
                    </tr>
                  ))
                ) : displayedData.length > 0 ? (
                  displayedData.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0"
                    >
                      <td className="px-4 py-4 text-sm font-semibold">{user.name}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{user.country}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold">{user.deposit}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold">{user.withdrawal}</td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant={statusConfig[user.status as UserStatus]?.variant || "default"}>{user.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(user)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCreateDeposit(user)}>
                                Create Deposit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateWithdrawal(user)}>
                                Create Withdrawal
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <UserEditModal user={selectedUser as any} open={editModalOpen} onOpenChange={setEditModalOpen} />
      <DepositModal
        userId={selectedUser?.id ? String(selectedUser.id) : null as any}
        userName={selectedUser?.name || null}
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
      />
      <WithdrawalModal
        userId={selectedUser?.id ? String(selectedUser.id) : null as any}
        userName={selectedUser?.name || null}
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
      />
    </>
  )
}
