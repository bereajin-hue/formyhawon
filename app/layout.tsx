import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Scholar Quest — 30일 영어 독서 챌린지",
  description: "AI 기반 영어 독서·에세이·어휘 학습 앱",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
