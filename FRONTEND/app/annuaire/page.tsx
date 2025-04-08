"use client"
import { useEffect, useState } from "react"
import styles from "./page.module.css"
import UsersList from "../../components/UsersList"
import type { User } from "../../types/User"
import { useAppContext } from "@/context/AppContext"
import { motion } from "framer-motion"
import { Users } from "lucide-react"

export default function Home() {
    const { controleur, canal, currentUser, setCurrentUser } = useAppContext()

    const nomDInstance = "HomePage"
    const verbose = false

    const listeMessageEmis = ["users_list_request"]
    const listeMessageRecus = ["users_list_response"]

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

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
                setIsLoading(false)
                if (!msg.users_list_response.etat) {
                    console.log(
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
            fetchUsersList()
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
    }, [])

    const fetchUsersList = () => {
        setIsLoading(true)
        const T = { users_list_request: {} }
        controleur?.envoie(handler, T)
    }

    return (
        <div className={styles.page}>
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.titleContainer}>
                    <Users className={styles.icon} />
                    <h1 className={styles.title}>Annuaire - Visioconf</h1>
                </div>
                <p className={styles.subtitle}>
                    Retrouvez tous les utilisateurs de la plateforme
                </p>
            </motion.div>

            <motion.main
                className={styles.main}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <UsersList
                    users={users}
                    currentUserEmail={currentUser?.email || ""}
                    isLoading={isLoading}
                />
            </motion.main>

            <motion.div
                className={styles.refreshButton}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchUsersList}
            >
                Actualiser
            </motion.div>
        </div>
    )
}
