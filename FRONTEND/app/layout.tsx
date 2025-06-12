"use client"

import "../styles/scrollbar.css"
import { Providers } from "@/providers"
import { AppContextProvider } from "@/context/AppContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { Provider } from "react-redux"
import { store } from "@/store/store"
import LayoutClient from "@/components/layoutClient"
import { GlobalStyles } from "@/components/GlobalStyles"
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
                <GlobalStyles />
                <Provider store={store}>
                    <Providers>
                        <AppContextProvider>
                            <NotificationProvider>
                                <LayoutClient>{children}</LayoutClient>
                            </NotificationProvider>
                        </AppContextProvider>
                    </Providers>
                </Provider>
            </body>
        </html>
    )
}
