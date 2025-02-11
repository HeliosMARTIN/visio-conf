"use client"
import { useSearchParams } from "next/navigation"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useEffect, useRef, useState } from "react"
import styles from "./MessagePage.module.css"
import getControleurInstance from "../../singletonControleur"
import CanalSocketio from "../canalsocketio/canalsocketio"
import { Message } from "../types/Message"

export default function MessagePage() {
    const searchParams = useSearchParams()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
        const firstName = searchParams.get("firstName")
        const lastName = searchParams.get("lastName")
        const email = searchParams.get("email")

        if (firstName) {
            setFirstName(firstName)
        }
        if (lastName) {
            setLastName(lastName)
        }
        if (email) {
            setEmail(email)
        }
    }, [searchParams])

    const controleur = getControleurInstance()
    const socket = io
    const canalSocketio = new CanalSocketio(socket, controleur, "socketIO")

    const nomDInstance = "MessagePage"
    const verbose = false

    // Messages
    const listeMessageEmis = ["messages_requete"]
    const listeMessageRecus = ["messages_reponse"]

    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState("")
    const [currentUser, setCurrentUser] = useState<Message | null>(null)

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            messages_reponse?: {
                etat: boolean
                messages?: Message[]
                error?: string
            }
        }) => {
            if (verbose || controleur.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.messages_reponse) {
                if (!msg.messages_reponse.etat) {
                    setError(
                        `Fetching messages failed: ${msg.messages_reponse.error}`
                    )
                } else {
                    setMessages(msg.messages_reponse.messages || [])
                }
            }
        },
    })

    useEffect(() => {
        const userInfo = Cookies.get("userInfo")

        if (userInfo) {
            setCurrentUser(JSON.parse(userInfo))
        }
        controleur.inscription(current, listeMessageEmis, listeMessageRecus)
        fetchMessages()

        return () => {
            controleur.desincription(
                current,
                listeMessageEmis,
                listeMessageRecus
            )
        }
    }, []) // Added empty dependency array to run only once

    const fetchMessages = () => {
        try {
            let T: {
                liste_utilisateurs_requete: {}
            } = {
                liste_utilisateurs_requete: {},
            }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("Failed to fetch messages list. Please try again.")
        }
    }

    return (
        <div className={styles.messagePage}>
            <h1>
                Conversation avec: {firstName} {lastName}
            </h1>
            <p className={styles.email}>Email: {email}</p>
        </div>
    )
}
