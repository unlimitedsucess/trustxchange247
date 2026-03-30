import { NextResponse } from "next/server"

export async function GET() {
  try {
    // List all coin IDs you want to fetch
    const coinIds = [
      "bitcoin",
      "ethereum",
      "cardano",
      "solana",
      "ripple",
      "polkadot",
      "litecoin",
      "chainlink",
      "polygon",
      "uniswap",
      "dogecoin",
      "bitcoin-cash",
      "stellar",
      "cosmos",
      "monero",
      "avalanche",
      "filecoin",
      "vechain",
      "theta-token",
      "tron"
    ].join(",")

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    )

    if (!res.ok) {
      console.warn("CoinGecko API rate limited or failed, falling back to mock data");
      return NextResponse.json({
        bitcoin: { usd: 64230.5, usd_24h_change: 2.4, usd_market_cap: 1200000000000 },
        ethereum: { usd: 3450.2, usd_24h_change: 1.8, usd_market_cap: 400000000000 },
        solana: { usd: 145.8, usd_24h_change: -0.5, usd_market_cap: 65000000000 },
        cardano: { usd: 0.45, usd_24h_change: 1.2, usd_market_cap: 15000000000 },
        ripple: { usd: 0.62, usd_24h_change: 0.5, usd_market_cap: 34000000000 },
      });
    }

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.warn("CoinGecko fetch failed completely, using mock data", err);
    return NextResponse.json({
      bitcoin: { usd: 64230.5, usd_24h_change: 2.4, usd_market_cap: 1200000000000 },
      ethereum: { usd: 3450.2, usd_24h_change: 1.8, usd_market_cap: 400000000000 },
      solana: { usd: 145.8, usd_24h_change: -0.5, usd_market_cap: 65000000000 },
    });
  }
}
