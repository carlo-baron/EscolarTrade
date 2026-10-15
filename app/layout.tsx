import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import { Metadata } from "next";

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const spaceGroteskHeading = Space_Grotesk({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: 'EscolarTrade',
  description: 'The trusted student marketplace for Centro Escolar University Malolos. Save money on textbooks, trade gadgets, sell pre-loved uniforms, and meet safely on campus with verified peers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, spaceGroteskHeading.variable)}
    >
      <body className="snap-y">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
