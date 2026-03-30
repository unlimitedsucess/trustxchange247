"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export function InvestmentTable({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Active Investments</h2>
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} columns={6} />
      ) : displayedData.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No active investments yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Start investing to see your portfolio grow.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Investment Plan</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Start Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">End Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">ROI %</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Current Growth</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((investment) => (
                  <tr
                    key={investment.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-4 text-sm font-semibold">{investment.plan}</td>
                    <td className="px-4 py-4 text-right text-sm">{investment.amount}</td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">{investment.startDate}</td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">{investment.endDate}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-accent">{investment.roi}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-accent">${investment.growth}</span>
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
