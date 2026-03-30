"use client"

import { useEffect, useState } from "react"

export function useCryptoPrices() {
  const [prices, setPrices] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/crypto/bitcoin/prices")
        if (!res.ok) throw new Error("Failed to fetch from server")
        const data = await res.json()
        setPrices(data)
      } catch (err) {
        console.error(err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  return { prices, loading, error }
}
