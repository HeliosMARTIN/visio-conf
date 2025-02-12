import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/context/SocketProvider";
import LayoutClient from "@/components/layoutClient"; // Import du composant client

export const metadata: Metadata = {
    title: "VisioConf",
    description: "VisioConf 2024 - 2025",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>
                <SocketProvider>
                    {children}
                    <LayoutClient />
                </SocketProvider>
            </body>
        </html>
    );
}
