"use client"
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import Controleur from "@/controllers/controleur"
import CanalSocketio from "@/controllers/canalsocketio"
import { User } from "@/types/User"
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

    useEffect(() => {
        controleurRef.current?.inscription(
            handler,
            listeMessageEmis,
            listeMessageRecus
        )
    }, [])

    useEffect(() => {
        if (
            !Cookies.get("token") &&
            pathname !== "/login" &&
            pathname !== "/signup"
        ) {
            setCurrentUser(null)
            router.push("/login")
        }
    }, [currentUser, pathname])

    useEffect(() => {
        if (!currentUser && Cookies.get("token")) {
            const token = Cookies.get("token")
            if (token) {
                const decoded = jwt.decode(token) as any
                const { userId } = decoded

                // Forcer une nouvelle connexion socket pour éviter les associations obsolètes
                if (canalRef.current?.socket) {
                    // Toujours déconnecter d'abord pour nettoyer l'ancienne connexion
                    if (canalRef.current.socket.connected) {
                        canalRef.current.socket.disconnect()
                    }

                    // Forcer la reconnexion immédiatement
                    canalRef.current.socket.connect()
                }
                const waitForCanalInit = () =>
                    new Promise<void>((resolve) => {
                        let attempts = 0
                        const maxAttempts = 50 // 5 seconds with 100ms intervals - plus de temps pour la reconnexion

                        const interval = setInterval(() => {
                            attempts++

                            if (
                                canalRef.current?.listeDesMessagesRecus
                                    ?.length &&
                                canalRef.current?.socket?.connected
                            ) {
                                clearInterval(interval)
                                resolve()
                            } else if (attempts >= maxAttempts) {
                                clearInterval(interval)
                                console.log(
                                    "Canal initialization completed (timeout reached)"
                                )
                                resolve()
                            }
                        }, 100)
                    })

                waitForCanalInit().then(() => {
                    // Send the request
                    if (canalRef.current && controleurRef.current) {
                        try {
                            controleurRef.current.envoie(handler, {
                                user_info_request: { userId },
                            }) // Authentifier le socket - simple et direct
                            if (canalRef.current?.socket) {
                                const socket = canalRef.current.socket

                                // Attendre la connexion puis authentifier
                                const handleAuth = () => {
                                    if (socket.connected) {
                                        socket.emit("authenticate", token)
                                    } else {
                                        // Si pas encore connecté, attendre l'événement connect
                                        const onConnect = () => {
                                            socket.emit("authenticate", token)
                                            socket.off("connect", onConnect)
                                        }
                                        socket.on("connect", onConnect)
                                    }
                                }

                                // Attendre un petit délai pour que la connexion soit établie
                                setTimeout(handleAuth, 200)
                            }
                        } catch (error) {
                            console.error(
                                "Error sending user_info_request:",
                                error
                            )
                        }
                    }
                })
            }
        }
    }, [currentUser, pathname])

    // S'assurer que le socket est connecté sur les pages login/signup
    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            if (
                canalRef.current?.socket &&
                !canalRef.current.socket.connected
            ) {
                console.log("Reconnecting socket for login/signup page")
                canalRef.current.socket.connect()
            }
        }
    }, [pathname])

    const logout = () => {
        // Déconnecter le socket pour nettoyer l'association côté serveur
        if (canalRef.current?.socket?.connected) {
            canalRef.current.socket.disconnect()
        }

        // Nettoyer les données locales
        Cookies.remove("token")
        localStorage.removeItem("auth_token")
        setCurrentUser(null)

        // Rediriger vers la page de connexion
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
