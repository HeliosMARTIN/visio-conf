"use client"

import { Providers } from "@/providers"
import { AppContextProvider } from "@/context/AppContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { Provider } from "react-redux"
import { store } from "@/store/store"
import LayoutClient from "@/components/layoutClient"
import { GlobalStyles } from "@/components/GlobalStyles"

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
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
        </>
    )
}
