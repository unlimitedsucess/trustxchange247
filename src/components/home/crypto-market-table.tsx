"use client"

import { useState, useEffect } from "react"
import { Search, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCryptoPrices } from "@/hooks/useCryptoPrices"

type SortKey = "name" | "price" | "change24h" | "marketCap"

type Crypto = {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  icon: string
}

export function CryptoMarketTable() {
  const { prices, loading, error } = useCryptoPrices()
  const [cryptoData, setCryptoData] = useState<Crypto[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("marketCap")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Map live prices to table format
  useEffect(() => {
    if (!prices) return
    const mapped: Crypto[] = Object.keys(prices).map((key) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      symbol: key.toUpperCase(),
      price: prices[key].usd ?? 0,
      change24h: prices[key].usd_24h_change ?? 0,
      marketCap: prices[key].usd_market_cap ?? 0,
      icon: key.charAt(0).toUpperCase(),
    }))
    setCryptoData(mapped)
  }, [prices])

  // Filter & search
  const filteredData = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortKey] ?? 0
    const bValue = b[sortKey] ?? 0
    const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    return sortDirection === "desc" ? -comparison : comparison
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const SortIcon = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return <span className="text-border h-4 w-4" />
    return sortDirection === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
  }

  if (loading) return <p className="text-center py-6">Loading market data...</p>
  if (error) return <p className="text-center py-6 text-red-500">{error}</p>

  return (
    <section className="w-full py-16 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Cryptocurrency Market</h2>
            <p className="text-muted-foreground">Track the top cryptocurrencies in real-time</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["name", "price", "change24h", "marketCap"].map((key) => (
                      <th
                        key={key}
                        className={`px-6 py-4 text-${key === "name" ? "left" : "right"}`}
                      >
                        <button
                          onClick={() => handleSort(key as SortKey)}
                          className="flex items-center justify-between gap-2 font-semibold text-sm hover:text-primary transition w-full"
                        >
                          {key === "name" ? "Name" : key === "price" ? "Price" : key === "change24h" ? "24h Change" : "Market Cap"}
                          <SortIcon isActive={sortKey === key} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((crypto) => (
                    <tr
                      key={crypto.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                            {crypto.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{crypto.name}</p>
                            <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold">
                          ${crypto.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-1 font-semibold text-sm ${
                            crypto.change24h >= 0 ? "text-accent" : "text-destructive"
                          }`}
                        >
                          {crypto.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {Math.abs(crypto.change24h).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-muted-foreground">${(crypto.marketCap / 1_000_000_000).toFixed(1)}B</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
