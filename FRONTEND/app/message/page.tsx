"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./messagePage.module.css"
import { useSocket } from "@/context/SocketProvider"
import { Message } from "../../types/Message"
import { User } from "../../types/User"

export default function MessagePage() {
    const { controleur, canal, currentUser } = useSocket()
    const searchParams = useSearchParams()
    const otherUserId = searchParams.get("id")

    const [otherUser, setOtherUser] = useState<User | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState("")
    const [newMessage, setNewMessage] = useState("")

    const nomDInstance = "MessagePage"
    const verbose = false

    const listeMessageEmis = [
        "messages_get_request",
        "message_send_request",
        "data_request",
    ]
    const listeMessageRecus = [
        "messages_get_response",
        "message_send_response",
        "data_response",
    ]
    console.log(error);
    

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            messages_get_response?: {
                etat: boolean
                messages?: Message[]
                error?: string
            }
            message_send_response?: { etat: boolean; error?: string }
            data_response?: { etat: boolean; user?: User; error?: string }
        }) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            if (msg.data_response) {
                if (!msg.data_response.etat) {
                    setError(
                        `Fetching user info failed: ${msg.data_response.error}`
                    )
                } else {
                    setOtherUser(msg.data_response.user || null)
                }
            }
            if (msg.messages_get_response) {
                if (!msg.messages_get_response.etat) {
                    setError(
                        `Fetching messages failed: ${msg.messages_get_response.error}`
                    )
                } else {
                    setMessages(msg.messages_get_response.messages || [])
                }
            }
            if (msg.message_send_response) {
                if (!msg.message_send_response.etat) {
                    setError(
                        `Sending message failed: ${msg.message_send_response.error}`
                    )
                } else {
                    fetchMessages()
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
            if (otherUserId) {
                const userDataMsg = { data_request: { id: otherUserId } }
                controleur.envoie(handler, userDataMsg)
            }
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
    }, [controleur, canal, otherUserId])

    const fetchMessages = () => {
        if (!otherUser || !currentUser) return
        try {
            const T = {
                messages_get_request: {
                    userEmail: currentUser.email,
                    otherUserEmail: otherUser.email,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Failed to fetch messages list. Please try again.")
        }
    }

    const sendMessage = () => {
        if (!otherUser || !currentUser) return
        try {
            const T = {
                message_send_request: {
                    userEmail: currentUser.email,
                    otherUserEmail: otherUser.email,
                    text: newMessage,
                },
            }
            controleur?.envoie(handler, T)
            setNewMessage("")
        } catch (err) {
            setError("Failed to send message. Please try again.")
        }
    }

    return (
        <div className={styles.messagePage}>
            <h1>
                Conversation avec:{" "}
                {otherUser
                    ? `${otherUser.firstname} ${otherUser.lastname}`
                    : "Loading..."}
            </h1>
            <p className={styles.email}>Email: {otherUser?.email}</p>
            <div className={styles.messagesContainer}>
                {messages.map((message) => (
                    <div key={message._id} className={styles.message}>
                        <img
                            src={message.message_sender.picture}
                            alt="User"
                            className={styles.userPicture}
                        />
                        <div className={styles.messageContent}>
                            <div className={styles.messageHeader}>
                                <span className={styles.userName}>
                                    {message.message_sender.firstname}{" "}
                                    {message.message_sender.lastname}
                                </span>
                                <span className={styles.timestamp}>
                                    {new Date(
                                        message.timestamp
                                    ).toLocaleTimeString()}
                                </span>
                            </div>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.sendMessageContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={styles.messageInput}
                />
                <button onClick={sendMessage} className={styles.sendButton}>
                    Send
                </button>
            </div>
        </div>
    )
}
