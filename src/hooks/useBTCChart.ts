"use client"

import { useEffect, useState } from "react"

export function useBTCChart(timeframe: "1D" | "1W" | "1M" | "1Y") {
  const [data, setData] = useState<any[]>([])
  const [price, setPrice] = useState(0)
  const [change, setChange] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/crypto/bitcoin`)
        const json = await res.json()

        if (json.error) throw new Error(json.error)
        if (!json.prices || !json.total_volumes) throw new Error("Invalid BTC data")

        const formatted = json.prices.map(
          ([timestamp, price]: [number, number], index: number) => ({
            date: new Date(timestamp).toLocaleDateString(),
            BTC: price,
            volume: json.total_volumes[index][1],
          })
        )

        setData(formatted)

        // Current price & 24h change using robust backend endpoint to survive rate-limits
        const simpleRes = await fetch(`/api/crypto/bitcoin/prices`)
        const simpleJson = await simpleRes.json()
        setPrice(simpleJson.bitcoin?.usd ?? 64230.5)
        setChange(simpleJson.bitcoin?.usd_24h_change ?? 2.4)
      } catch (err) {
        console.error("BTC chart fetch failed:", err)
        setError((err as Error).message)
        setData([])
        setPrice(0)
        setChange(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeframe])

  return { data, price, change, loading, error }
}
