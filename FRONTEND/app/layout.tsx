import ClientProviders from "@/components/ClientProviders"
import "../styles/scrollbar.css"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "VisioConf",
    description: "VisioConf 2024 - 2025",
    icons: {
        icon: "/Logo_Univ.png",
        shortcut: "/Logo_Univ.png",
        apple: "/Logo_Univ.png",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body>
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    )
}
