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
    const listeMessageEmis = ["messages_get_request", "message_send_request"]
    const listeMessageRecus = ["messages_get_response", "message_send_response"]

    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState("")
    const [currentUser, setCurrentUser] = useState<User>()
    const [newMessage, setNewMessage] = useState("")

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            messages_get_response?: {
                etat: boolean
                messages?: Message[]
                error?: string
            }
            message_send_response?: {
                etat: boolean
                error?: string
            }
        }) => {
            if (verbose || controleur.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

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
                messages_get_request: {
                    userEmail: string | undefined
                    otherUserEmail: string
                }
            } = {
                messages_get_request: {
                    userEmail: currentUser?.email || "",
                    otherUserEmail: otherUserEmail,
                },
            }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("Failed to fetch messages list. Please try again.")
        }
    }

    const sendMessage = () => {
        try {
            let T: {
                message_send_request: {
                    userEmail: string
                    otherUserEmail: string
                    text: string
                }
            } = {
                message_send_request: {
                    userEmail: currentUser?.email || "",
                    otherUserEmail: otherUserEmail,
                    text: newMessage,
                },
            }
            controleur.envoie(canalSocketio, T)
            setNewMessage("")
        } catch (err) {
            setError("Failed to send message. Please try again.")
        }
    }

    return (
        <div className={styles.messagePage}>
            <h1>
                Conversation avec: {firstName} {lastName}
            </h1>
            <p className={styles.email}>Email: {otherUserEmail}</p>
            <div className={styles.messagesContainer}>
                {messages.map((message) => (
                    <div key={message._id} className={styles.message}>
                        <img
                            src={message.message_sender.user_picture}
                            alt="User"
                            className={styles.userPicture}
                        />
                        <div className={styles.messageContent}>
                            <div className={styles.messageHeader}>
                                <span className={styles.userName}>
                                    {message.message_sender.user_firstname}{" "}
                                    {message.message_sender.user_lastname}
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
