"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import UsersList from "../components/UsersList"
import CurrentUser from "../components/CurrentUser"
import { User } from "../types/User"
import { useSocket } from "@/context/SocketProvider"

export default function Home() {
    const { controleur, canal, currentUser, setCurrentUser } = useSocket()
    const router = useRouter()

    const nomDInstance = "HomePage"
    const verbose = false

    const listeMessageEmis = ["users_list_request"]
    const listeMessageRecus = ["users_list_response"]

    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState("")

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            users_list_response?: {
                etat: boolean
                users?: User[]
                error?: string
            }
        }) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            if (msg.users_list_response) {
                if (!msg.users_list_response.etat) {
                    setError(
                        `Fetching users failed: ${msg.users_list_response.error}`
                    )
                } else {
                    setUsers(msg.users_list_response.users || [])
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        }
        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [router, controleur, canal])

    const fetchUsersList = () => {
        try {
            const T = { users_list_request: {} }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Failed to fetch users list. Please try again.")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        setCurrentUser(null)
        router.push("/login")
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Accueil - Visioconf</h1>
                {error && <div className={styles.error}>{error}</div>}
                <button onClick={fetchUsersList}>Fetch Users List</button>
                <UsersList
                    users={users}
                    currentUserEmail={currentUser?.email || ""}
                />
                <button onClick={handleLogout}>Logout</button>
            </main>
            {currentUser && <CurrentUser user={currentUser} />}
        </div>
    )
}
