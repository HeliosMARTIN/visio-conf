"use client"

import React, { useState, useEffect, useRef } from "react"
import { Discussion } from "@/types/Discussion"
import { User } from "@/types/User"
import { Message } from "@/types/Message"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useAppContext } from "@/context/AppContext"
import { v4 as uuidv4 } from "uuid"

interface ChatWindowProps {
    discussion?: Discussion
    messages: Message[]
    currentUser: User
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    discussion,
    messages,
    currentUser,
}) => {
    const [newMessage, setNewMessage] = useState("")
    const [localMessages, setLocalMessages] = useState<Message[]>([])
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
    const { controleur } = useAppContext()
    // Créer un identifiant unique pour chaque instance de ChatWindow
    const nomDInstance = useRef(`ChatWindow_${discussion?.discussion_uuid || ""}_${currentUser?.id || ""}`).current
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(true) // Pour détecter si la fenêtre est visible

    const listeMessageEmis = ["message_send_request", "messages_get_request", "discuss_remove_message_request", "message_status_request"]
    const listeMessageRecus = ["message_send_response", "messages_get_response", "discuss_remove_message_response", "message_status_response"]

    // Initialiser les messages locaux quand les messages props changent
    useEffect(() => {
        setLocalMessages(messages)
        scrollToBottom()
    }, [messages])

    // Scroll to bottom when localMessages changes
    useEffect(() => {
        scrollToBottom()
    }, [localMessages])

    // Marquer les messages comme lus quand la discussion devient visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // // Marquer automatiquement les messages comme lus
    // useEffect(() => {
    //     if (discussion && isVisible && localMessages.length > 0) {
    //         // Déclencher la mise à jour du statut de lecture après un court délai
    //         const timer = setTimeout(() => {
    //             markMessagesAsRead()
    //         }, 1000) // Attendre 1 seconde avant de marquer comme lu

    //         return () => clearTimeout(timer)
    //     }
    // }, [discussion, localMessages, isVisible])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Fonction utilitaire pour vérifier si un message provient de l'utilisateur actuel
    const isCurrentUserMessage = (message: Message): boolean => {
        const senderId = message.message_sender._id
        const currentUserId = currentUser.id

        // Si l'email est disponible, c'est la méthode la plus fiable pour comparer
        if (message.message_sender.email && currentUser.email) {
            return message.message_sender.email === currentUser.email
        }

        // Sinon, essayer les différents IDs
        return senderId === currentUserId
    }

    const markMessagesAsRead = () => {
        if (!discussion || !controleur) return

        const message = {
            message_status_request: discussion.discussion_uuid,
        }
        controleur.envoie(handler, message)
    }

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            console.log("[ChatWindow] Message reçu:", msg, "dans la discussion:", discussion?.discussion_uuid)
            
            if (msg?.message_send_response) {
                console.log("[ChatWindow] Message send response reçue. ID:", msg.id, "Discussion UUID:", msg.message_send_response.discussion_uuid)
                if (!msg.message_send_response.etat) {
                    console.error(
                        "[ChatWindow] Erreur lors de l'envoi du message:",
                        msg.message_send_response.error
                    )
                } else {
                    // Pour tous les utilisateurs de la discussion
                    if (discussion && discussion.discussion_uuid === msg.message_send_response.discussion_uuid) {
                        console.log("[ChatWindow] Rafraichissement des messages de la discussion")
                        fetchMessages()
                        
                        // Actions supplémentaires uniquement pour l'expéditeur
                        if (msg.id?.includes(nomDInstance)) {
                            console.log("[ChatWindow] Mise à jour de la liste des discussions pour l'expéditeur")
                            const messageContent = newMessage.trim()
                            const event = new CustomEvent("discussion-updated", {
                                detail: {
                                    discussionId: discussion.discussion_uuid,
                                    lastMessage: {
                                        message_content: messageContent,
                                        message_date_create: new Date().toISOString(),
                                    },
                                },
                            })
                            document.dispatchEvent(event)
                            setNewMessage("")
                        }
                    }
                }
            }

            if (msg.messages_get_response) {
                if (msg.messages_get_response.etat) {
                    console.log("[ChatWindow] Mise à jour des messages locaux")
                    setLocalMessages(msg.messages_get_response.messages || [])
                    scrollToBottom()
                }
            }

            if (msg.discuss_remove_message_response) {
                if (msg.discuss_remove_message_response.etat) {
                    console.log("[ChatWindow] Message supprimé avec succès")
                    // Rafraîchir les messages après suppression
                    fetchMessages()
                } else {
                    console.error("[ChatWindow] Erreur lors de la suppression du message:", msg.discuss_remove_message_response.error)
                }
            }

            if (msg.message_status_response) {
                if (msg.message_status_response.etat) {
                    console.log("[ChatWindow] Statut de lecture mis à jour avec succès")
                    // Rafraîchir les messages pour obtenir les nouveaux statuts
                    fetchMessages()
                } else {
                    console.error("[ChatWindow] Erreur lors de la mise à jour du statut:", msg.message_status_response.error)
                }
            }
        },
    }

    useEffect(() => {
        // Register handler when component mounts
        if (controleur) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        }

        // Unregister handler when component unmounts
        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [controleur])

    const fetchMessages = () => {
        if (!discussion || !controleur) return

        const message = {
            messages_get_request: {
                convId: discussion.discussion_uuid,
            },
        }
        controleur.envoie(handler, message)
    }

    const handleDeleteMessage = (messageId: string) => {
        if (!discussion || !controleur) return

        // Confirmer la suppression
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
            const message = {
                discuss_remove_message_request: [messageId, discussion.discussion_uuid],
            }
            controleur.envoie(handler, message)
        }
    }

    const handleEmojiReaction = (messageId: string) => {
        // Placeholder pour la fonctionnalité emoji
        // Vous pouvez implémenter un sélecteur d'emoji ici
        console.log("Réaction emoji pour le message:", messageId)
        // Pour l'instant, on peut juste afficher une alerte
        alert("Fonctionnalité de réaction emoji à implémenter")
    }

    // Fonction pour afficher les coches de lecture
    const renderReadStatus = (message: Message) => {
        if (!isCurrentUserMessage(message)) return null
        
        const status = message.message_status || 'sent'
        
        return (
            <div className="read-status">
                {status === 'sent' && (
                    <span className="check-single" title="Message envoyé">✓</span>
                )}
                {status === 'read' && (
                    <span className="check-double" title="Message lu">✓✓</span>
                )}
            </div>
        )
    }

    if (!discussion) {
        return null
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !controleur || !currentUser) return
        console.log("Message sender:", currentUser)

        const messageUuid = uuidv4()
        const currentDate = new Date()

        // Créer le message à envoyer
        const messageSender = {
            _id: currentUser.id,
            email: currentUser.email,
            firstname: currentUser.firstname || "",
            lastname: currentUser.lastname || "",
        }
        const messageToSend: Message = {
            message_uuid: messageUuid,
            message_content: newMessage.trim(),
            message_date_create: currentDate.toISOString(),
            message_sender: messageSender,
            message_status: 'sent' // Nouveau statut par défaut
        }
        // Mettre à jour les messages locaux pour afficher le nouveau message
        setLocalMessages((prevMessages) => [
            ...prevMessages,
            messageToSend,
        ])
        scrollToBottom()
        // Créer le message à envoyer au contrôleur
        if (!discussion.discussion_uuid) {
            console.error("Discussion UUID is missing")
            return
        }

        const message = {
            message_send_request: {
                userEmail: currentUser.email,
                discussion_uuid: discussion.discussion_uuid,
                message_uuid: messageUuid,
                message_content: newMessage.trim(),
                message_date_create: currentDate.toISOString(),
            },
            id: nomDInstance // Identifiant unique de l'instance ChatWindow
        }

        try {
            controleur.envoie(handler, message)
            setNewMessage("")
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error)
        }
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>{discussion.discussion_name || "Discussion"}</h2>
            </div>

            <div className="messages-container">
                {localMessages.map((message) => (
                    <div
                        key={message.message_uuid}
                        className={`message ${
                            isCurrentUserMessage(message) ? "sent" : "received"
                        }`}
                        onMouseEnter={() => setHoveredMessageId(message.message_uuid)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        style={{ position: 'relative' }}
                    >
                        <div className="message-content">
                            {message.message_content}
                        </div>
                        <div className="message-info">
                            <span className="sender-name">
                                {isCurrentUserMessage(message)
                                    ? "Vous"
                                    : `${
                                          message.message_sender.firstname || ""
                                      } ${
                                          message.message_sender.lastname || ""
                                      }`}
                            </span>
                            <span className="message-time">
                                {formatDistanceToNow(
                                    new Date(message.message_date_create),
                                    {
                                        addSuffix: true,
                                        locale: fr,
                                    }
                                )}
                            </span>
                            {renderReadStatus(message)}
                        </div>
                        
                        {/* Actions de survol */}
                        {hoveredMessageId === message.message_uuid && (
                            <div className="message-actions">
                                <button
                                    className="action-btn emoji-btn"
                                    onClick={() => handleEmojiReaction(message.message_uuid)}
                                    title="Réagir avec un emoji"
                                >
                                    😊
                                </button>
                                {isCurrentUserMessage(message) && (
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteMessage(message.message_uuid)}
                                        title="Supprimer le message"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                />
                <button type="submit">Envoyer</button>
            </form>
        </div>
    )
}

export default ChatWindow