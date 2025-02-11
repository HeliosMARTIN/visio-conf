import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: "VisioConf",
    description: "VisioConf 2024 - 2025",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr">
            <body>{children}</body>
        </html>
    )
}
