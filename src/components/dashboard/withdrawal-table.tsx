"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  approved: { variant: "default" },
  pending: { variant: "secondary" },
  rejected: { variant: "destructive" },
  Approved: { variant: "default" },
  Pending: { variant: "secondary" },
  Rejected: { variant: "destructive" },
}

export function WithdrawalTable({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Withdrawals</h2>
      </div>

      {displayedData.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No withdrawal requests yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-4 text-sm font-bold text-primary">{withdrawal.amount}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{withdrawal.date || withdrawal.requestDate}</td>
                    <td className="px-4 py-4 text-sm capitalize">
                      <Badge variant={statusConfig[withdrawal.status]?.variant || "outline"}>
                        {withdrawal.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
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
        </>
      )}
    </Card>
  )
}
