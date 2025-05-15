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

    const hasAuthenticatedRef = useRef(false)

    useEffect(() => {
        if (
            !currentUser &&
            Cookies.get("token") &&
            !hasAuthenticatedRef.current
        ) {
            const token = Cookies.get("token")
            if (token) {
                const { userId } = jwt.decode(token) as any
                const waitForCanalInit = () =>
                    new Promise<void>((resolve) => {
                        const interval = setInterval(() => {
                            if (
                                canalRef.current?.listeDesMessagesRecus?.length
                            ) {
                                clearInterval(interval)
                                resolve()
                            }
                        }, 100)
                    })

                waitForCanalInit().then(() => {
                    controleurRef.current?.envoie(handler, {
                        user_info_request: { userId },
                    })
                    canalRef.current?.socket.emit("authenticate", token)
                    hasAuthenticatedRef.current = true
                })
            }
        }
    }, [currentUser])
  
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
