"use client"
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react"
import { useRouter } from "next/navigation"
import Controleur from "@/controllers/controleur"
import CanalSocketio from "@/controllers/canalsocketio"
import { User } from "@/types/User"
import jwt from "jsonwebtoken"

interface AppContextType {
    controleur: Controleur
    canal: CanalSocketio
    currentUser: User | null
    setCurrentUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const router = useRouter()

    const controleurRef = useRef<Controleur>(null)
    const canalRef = useRef<CanalSocketio>(null)

    if (!controleurRef.current) {
        controleurRef.current = new Controleur()
    }
    if (!canalRef.current) {
        canalRef.current = new CanalSocketio(
            controleurRef.current,
            "CanalGlobal"
        )
    }

    const [currentUser, setCurrentUser] = useState<User | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            if (!currentUser) {
                const user = jwt.decode(token) as User
                setCurrentUser(user)
            }
            if (canalRef.current?.socket) {
                canalRef.current.socket.emit("authenticate", token)
            }
        } else {
            setCurrentUser(null)
            router.push("/login")
        }
    }, [])

    useEffect(() => {
        return () => {
            canalRef.current?.socket.disconnect()
        }
    }, [])

    return (
        <AppContext.Provider
            value={{
                controleur: controleurRef.current,
                canal: canalRef.current,
                currentUser,
                setCurrentUser,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context)
        throw new Error("useApp must be used within an AppContextProvider")
    return context
}
