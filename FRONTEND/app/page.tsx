"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import styles from "./page.module.css"
import {CanalSocketio} from "../controllers/canalsocketio"
import io from "socket.io-client"
import UsersList from "../components/UsersList"
import CurrentUser from "../components/CurrentUser"
import { User } from "../types/User"
import { Controleur } from "@/controllers/controleur"

const controleur = new Controleur()
const socket = io
const canalSocketio = new CanalSocketio(controleur, "canalsocketio");

export default function Home() {
    const router = useRouter()

    const nomDInstance = "HomePage"
    const verbose = false

    // Messages
    const listeMessageEmis = ["users_list_request"]
    const listeMessageRecus = ["users_list_response"]

    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState("")
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            users_list_response?: {
                etat: boolean
                users?: User[]
                error?: string
            }
        }) => {
            if (verbose || controleur.verboseall)
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
    })

    useEffect(() => {
        const loggedIn = Cookies.get("loggedIn")
        const userInfo = Cookies.get("userInfo")
        if (!loggedIn) {
            router.push("/login")
        } else {
            if (userInfo) {
                try {
                    const parsedUserInfo = JSON.parse(userInfo)
                    if (parsedUserInfo && typeof parsedUserInfo === 'object') {
                        setCurrentUser(parsedUserInfo)
                    } else {
                        console.error("Invalid user info format")
                        router.push("/login")
                        return;
                    }
                } catch (error) {
                    console.error("Error parsing user info:", error)
                    // Clear invalid cookies
                    Cookies.remove("userInfo")
                    Cookies.remove("loggedIn")
                    router.push("/login")
                    return;
                }
            }
            controleur.inscription(current, listeMessageEmis, listeMessageRecus)
            console.log("init page")

            fetchUsersList()
        }

        return () => {
            controleur.desincription(
                current,
                listeMessageEmis,
                listeMessageRecus
            )
        }
    }, [router])

    const fetchUsersList = () => {
        try {
            let T: {
                users_list_request: {}
            } = {
                users_list_request: {},
            }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("Failed to fetch users list. Please try again.")
        }
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Accueil - Visioconf</h1>
                {error && <div className={styles.error}>{error}</div>}
                <UsersList
                    users={users}
                    currentUserEmail={currentUser?.email || ""}
                />
            </main>
            {currentUser && <CurrentUser user={currentUser} />}
        </div>
    )
}
