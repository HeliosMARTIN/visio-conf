"use client"

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import Controleur from "@/controllers/controleur"
import CanalSocketio from "@/controllers/canalsocketio"
import { User } from "@/types/User"
import { JwtPayload } from "jsonwebtoken"

interface SocketContextType {
    controleur: Controleur
    canal: CanalSocketio
    currentUser: any
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
}

const SocketContext = createContext<SocketContextType | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
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
        return () => {
            canalRef.current?.socket.disconnect()
        }
    }, [])

    return (
        <SocketContext.Provider
            value={{
                controleur: controleurRef.current,
                canal: canalRef.current,
                currentUser,
                setCurrentUser,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => {
    const context = useContext(SocketContext)
    if (!context)
        throw new Error("useSocket must be used within a SocketProvider")
    return context
}
