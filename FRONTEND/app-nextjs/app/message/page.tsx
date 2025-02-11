"use client"
import { useSearchParams } from "next/navigation"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useEffect, useRef, useState } from "react"
import styles from "./MessagePage.module.css"
import CanalSocketio from "../../controllers/canalsocketio"
import { Message } from "../../types/Message"
import Controleur from "@/controllers/controleur"
import { User } from "../../types/User"

const controleur = new Controleur()
const socket = io
const canalSocketio = new CanalSocketio(socket, controleur, "socketIO")

export default function MessagePage() {
    const searchParams = useSearchParams()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [otherUserEmail, setOtherUserEmail] = useState("")

    useEffect(() => {
        const firstName = searchParams.get("firstName")
        const lastName = searchParams.get("lastName")
        const otherUserEmail = searchParams.get("otherUserEmail")

        if (firstName) {
            setFirstName(firstName)
        }
        if (lastName) {
            setLastName(lastName)
        }
        if (otherUserEmail) {
            setOtherUserEmail(otherUserEmail)
        }
    }, [searchParams])

    const nomDInstance = "MessagePage"
    const verbose = false

    // Messages
    const listeMessageEmis = ["messages_requete"]
    const listeMessageRecus = ["messages_reponse"]

    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState("")
    const [currentUser, setCurrentUser] = useState<User | null>(null)

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
    }, [otherUserEmail])

    const fetchMessages = () => {
        try {
            let T: {
                messages_requete: {
                    userEmail: string | undefined
                    otherUserEmail: string
                }
            } = {
                messages_requete: {
                    userEmail: currentUser?.email,
                    otherUserEmail: otherUserEmail,
                },
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
            <p className={styles.email}>Email: {otherUserEmail}</p>
        </div>
    )
}
