import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin task manager',
  description: 'Nextjs Task manager',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
