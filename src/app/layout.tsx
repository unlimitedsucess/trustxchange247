import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import Script from "next/script"
import "./globals.css"
import ReduxProvider from "@/store/provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TrustXchange247 | Modern Cryptocurrency Investment Platform",
  description: "Join thousands of investors growing their wealth through our secure, transparent, and professional cryptocurrency investment platform.",
  keywords: "cryptocurrency, investing, bitcoin, ethereum, ROI, trustxchange247, trading platform",
  openGraph: {
    title: "TrustXchange247 | Secure Crypto Investments",
    description: "Grow your wealth securely with TrustXchange247. Professional crypto trading and automated ROI plans.",
    url: "https://trustxchange247.com",
    siteName: "TrustXchange247",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustXchange247 | Crypto Investments",
    description: "Secure, transparent, and professional cryptocurrency investment platform.",
  },
  generator: "Next.js",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          <Providers>{children}</Providers>
        </ReduxProvider>
        <Analytics />
        
        {/* Tawk.to Live Chat Script */}
        <Script 
          id="tawk-to" 
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/65d1d6a68d261e1b5f621980/1hn01hjeb';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
