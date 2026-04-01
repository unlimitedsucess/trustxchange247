"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight, Edit2, MoreVertical, Plus, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UserEditModal } from "./user-edit-modal"
import { DepositModal } from "./deposit-modal"
import { WithdrawalModal } from "./withdrawal-modal"
import { UserCreateModal } from "./user-create-modal"
import { UserSuspendModal } from "./user-suspend-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { useToast } from "@/hooks/use-toast"

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  deposit: string;
  withdrawal: string;
  status: "active" | "suspended";
  transactionPin?: string;
  totalBonus: number;
  kycStatus: string;
  idDocument?: string;
  selfieDocument?: string;
};

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { variant: "default" },
  suspended: { variant: "destructive" },
}

export function AdminUsersTable() {
  const [usersData, setUsersData] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const token = useSelector((state: RootState) => state.token.token)

  const fetchUsers = async () => {
    try {
      setLoading(true)
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
          status: u.status || "active",
          transactionPin: u.transactionPin || "",
          totalBonus: u.totalBonus || 0,
          kycStatus: u.kycStatus || "unverified",
          idDocument: u.idDocument,
          selfieDocument: u.selfieDocument
        }))
        setUsersData(mappedUsers)
      }
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token])

  const itemsPerPage = 8
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

  const handleSuspend = (user: AdminUser) => {
    setSelectedUser(user)
    setSuspendModalOpen(true)
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to permanently delete user: ${user.name}? This action cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: "Success", description: "User and all related data purged." })
        setUsersData(usersData.filter(u => u.id !== user.id))
      } else {
        toast({ title: "Error", description: "Operation failed", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  return (
    <>
      <Card className="p-6 border-border bg-card shadow-lg">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-bold">Member Directory</h2>
               <p className="text-xs text-muted-foreground">Manage and monitor all platform participants.</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setCreateModalOpen(true)}>
              <Plus size={16} /> Create New User
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or wallet..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 h-11 bg-muted/30"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Name & Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Flow (In/Out)</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Control</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                    </tr>
                  ))
                ) : displayedData.length > 0 ? (
                  displayedData.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-foreground">{user.name}</span>
                           <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground">{user.country}</td>
                      <td className="px-4 py-4 text-right">
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-success">+{user.deposit}</span>
                           <span className="text-xs font-bold text-destructive">-{user.withdrawal}</span>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-center flex flex-col items-center gap-1 mt-2">
                        <Badge variant={statusConfig[user.status]?.variant || "secondary"} className="capitalize">
                          {user.status}
                        </Badge>
                        <Badge variant="outline" className={`capitalize text-[9px] ${user.kycStatus === 'verified' ? 'text-success border-success' : user.kycStatus === 'pending' ? 'text-yellow-500 border-yellow-500' : 'text-muted-foreground'}`}>KYC: {user.kycStatus}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border" onClick={() => handleEdit(user)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setDepositModalOpen(true); }} className="gap-2">
                                <Plus size={14} className="text-success" /> Create Deposit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setWithdrawalModalOpen(true); }} className="gap-2">
                                <Plus size={14} className="text-destructive" /> Create Withdrawal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === "active" ? (
                                <DropdownMenuItem onClick={() => handleSuspend(user)} className="text-destructive gap-2 focus:bg-destructive/10">
                                  <ShieldAlert size={14} /> Suspend Member
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleSuspend(user)} className="text-primary gap-2 focus:bg-primary/10">
                                  <ShieldCheck size={14} /> Reactivate Member
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive font-bold gap-2 focus:bg-destructive/20">
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                   className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
      <UserCreateModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
        onSuccess={fetchUsers} 
      />
      
      {selectedUser && (
        <>
          <UserEditModal 
            user={selectedUser as any} 
            open={editModalOpen} 
            onOpenChange={setEditModalOpen} 
          />
          <UserSuspendModal 
            userId={selectedUser.id} 
            userName={selectedUser.name} 
            open={suspendModalOpen} 
            onOpenChange={setSuspendModalOpen} 
            onSuccess={fetchUsers}
            isSuspending={selectedUser.status === "active"}
          />
          <DepositModal
            userId={selectedUser.id}
            userName={selectedUser.name}
            open={depositModalOpen}
            onOpenChange={setDepositModalOpen}
          />
          <WithdrawalModal
            userId={selectedUser.id}
            userName={selectedUser.name}
            open={withdrawalModalOpen}
            onOpenChange={setWithdrawalModalOpen}
          />
        </>
      )}
    </>
  )
}
