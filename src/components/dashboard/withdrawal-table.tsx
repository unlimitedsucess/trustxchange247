"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const withdrawalData = [
  {
    id: 1,
    amount: "$2,500.00",
    requestDate: "2025-01-20",
    status: "Approved",
  },
  {
    id: 2,
    amount: "$1,850.50",
    requestDate: "2025-01-18",
    status: "Approved",
  },
  {
    id: 3,
    amount: "$875.00",
    requestDate: "2025-01-17",
    status: "Pending",
  },
]

type WithdrawalStatus = "Approved" | "Pending" | "Rejected"

const statusConfig: Record<
  WithdrawalStatus,
  { color: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  Approved: { color: "bg-accent/10 text-accent", variant: "default" },
  Pending: { color: "bg-primary/10 text-primary", variant: "secondary" },
  Rejected: { color: "bg-destructive/10 text-destructive", variant: "destructive" },
}

export function WithdrawalTable({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Withdrawal History</h2>
      </div>

      {displayedData.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No withdrawal requests yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Use the withdrawal form above to request a withdrawal.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Request Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-4 text-sm font-semibold">{withdrawal.amount}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{withdrawal.requestDate}</td>
                    <td className="px-4 py-4 text-sm">
                      <Badge variant={statusConfig[withdrawal.status as WithdrawalStatus].variant}>
                        {withdrawal.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of{" "}
              {data.length}
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
              {Array.from({ length: totalPages }).map((_, i) => (
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
        </>
      )}
    </Card>
  )
}
