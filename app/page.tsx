"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import styles from "./page.module.css"
import getControleurInstance from "./singletonControleur"
import CanalSocketio from "./canalsocketio/canalsocketio"
import io from "socket.io-client"
import UsersList from "./components/UsersList"
import CurrentUser from "./components/CurrentUser"
import { User } from "./types/User"

export default function Home() {
    const controleur = getControleurInstance()
    const socket = io
    const canalSocketio = new CanalSocketio(socket, controleur, "socketIO")
    const router = useRouter()

    const nomDInstance = "HomePage"
    const verbose = false

    // Messages
    const listeMessageEmis = ["liste_utilisateurs_requete"]
    const listeMessageRecus = ["liste_utilisateurs_reponse"]

    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState("")
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            liste_utilisateurs_reponse?: {
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

            if (msg.liste_utilisateurs_reponse) {
                if (!msg.liste_utilisateurs_reponse.etat) {
                    setError(
                        `Fetching users failed: ${msg.liste_utilisateurs_reponse.error}`
                    )
                } else {
                    setUsers(msg.liste_utilisateurs_reponse.users || [])
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
                setCurrentUser(JSON.parse(userInfo))
            }
            controleur.inscription(current, listeMessageEmis, listeMessageRecus)
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
                liste_utilisateurs_requete: {}
            } = {
                liste_utilisateurs_requete: {},
            }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("Failed to fetch users list. Please try again.")
        }
    }

    const handleMessage = (user: User) => {
        router.push(`/message/${user.email}`)
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
