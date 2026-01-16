import type { Metadata, Viewport } from "next"
import { Space_Grotesk } from "next/font/google"
import "../globals.css"
import { Providers } from "@/components/Providers"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "HyLo Widget - Deposit to Hyperliquid",
  description: "Embeddable widget for depositing to Hyperliquid from any chain",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
