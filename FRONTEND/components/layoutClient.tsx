'use client'

import { usePathname } from 'next/navigation'
import Menu from "@/components/Menu"

export default function MenuWrapper() {
    const pathname = usePathname()
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    if (isAuthPage) {
        return null
    }

    return <Menu />
}