"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Controleur from "@/controllers/controleur"
import CanalSocketio from "@/controllers/canalsocketio"
import type { User } from "@/types/User"
import jwt from "jsonwebtoken"
import Cookies from "js-cookie"

interface AppContextType {
    controleur: Controleur
    canal: CanalSocketio
    currentUser: User | null
    setCurrentUser: (user: User | null) => void
    logout: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const router = useRouter()
    const pathname = usePathname()

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

    const nomDInstance = "AppContextProvider"
    const verbose = false
    const listeMessageEmis = ["user_info_request"]
    const listeMessageRecus = ["user_info_response"]
    
    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            user_info_response?: {
                etat: boolean
                userInfo?: User
                error?: string
            }
        }) => {
            if (verbose)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            if (msg.user_info_response) {
                if (!msg.user_info_response.etat) {
                    console.log(
                        "Failed to fetch user info: ",
                        msg.user_info_response.error
                    )
                } else {
                    setCurrentUser(msg.user_info_response.userInfo || null)
                }
            }
        },
    }

    // Inscription au contrôleur
    useEffect(() => {
        controleurRef.current?.inscription(
            handler,
            listeMessageEmis,
            listeMessageRecus
        )
        return () => {
            controleurRef.current?.desincription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            )
        }
    }, [])

    // Redirection si pas de token
    useEffect(() => {
        const tokenFromCookie = Cookies.get("token")
        const tokenFromStorage = localStorage.getItem("auth_token")
        const hasToken = tokenFromCookie || tokenFromStorage

        if (!hasToken && pathname !== "/login" && pathname !== "/signup") {
            setCurrentUser(null)
            router.push("/login")
        }
    }, [currentUser, pathname])

    // Récupération des infos utilisateur
    useEffect(() => {
        if (!currentUser) {
            const token = Cookies.get("token") || localStorage.getItem("auth_token")

            if (token) {
                const decoded = jwt.decode(token) as any
                const { userId } = decoded

                // Fonction simple pour attendre la connexion et envoyer la requête
                const sendUserInfoRequest = () => {
                    if (canalRef.current?.socket?.connected && controleurRef.current) {
                        try {
                            controleurRef.current.envoie(handler, {
                                user_info_request: { userId },
                            })
                            
                            // Authentifier le socket
                            canalRef.current.socket.emit("authenticate", token)
                        } catch (error) {
                            console.error("Erreur lors de l'envoi de user_info_request:", error)
                        }
                    } else {
                        // Réessayer dans 200ms
                        setTimeout(sendUserInfoRequest, 200)
                    }
                }

                // Démarrer la tentative
                sendUserInfoRequest()
            }
        }
    }, [currentUser, pathname])

    // Connexion socket pour login/signup
    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            if (canalRef.current?.socket && !canalRef.current.socket.connected) {
                canalRef.current.socket.connect()
            }
        }
    }, [pathname])

    const logout = () => {
        // Déconnecter le socket
        if (canalRef.current?.socket?.connected) {
            canalRef.current.socket.disconnect()
        }

        // Nettoyer les données
        Cookies.remove("token")
        localStorage.removeItem("auth_token")
        setCurrentUser(null)

        // Rediriger
        router.push("/login")
    }

    return (
        <AppContext.Provider
            value={{
                controleur: controleurRef.current,
                canal: canalRef.current,
                currentUser,
                setCurrentUser,
                logout,
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
