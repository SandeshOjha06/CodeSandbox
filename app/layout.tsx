import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Code Editor",
  description: "Online code editor",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        {/* Theme init script: ensures theme class (dark/light) is applied before React hydrates to avoid hydration mismatch */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            try {
              const theme = localStorage.getItem('theme')
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
              const isDark = theme === 'dark' || (!theme && prefersDark)
              if (isDark) document.documentElement.classList.add('dark')
              else document.documentElement.classList.remove('dark')
            } catch (e) { /* ignore */ }
          })()
        `}} />
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}