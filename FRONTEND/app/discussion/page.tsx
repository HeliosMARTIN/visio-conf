"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import { Discussion } from "@/types/Discussion"
import { Message } from "@/types/Message"
import { CreateDiscussion } from "@/components/discussion/Create/page"
import DiscussionsList from "@/components/discussion/DiscussList/DiscussList"
import ChatWindow from "@/components/discussion/ChatWindow/ChatWindow"
import { sortDiscussionsByLatestMessage } from "@/utils/discussion"
import "./discussion.css"

export default function DiscussionPage() {
    const { controleur, canal, currentUser } = useAppContext()
    const router = useRouter()
    const [discussions, setDiscussions] = useState<Discussion[]>([])
    const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(
        null
    )
    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState("")
    const [showCreateDiscussion, setShowCreateDiscussion] = useState(false)
    const [searchResults, setSearchResults] = useState([])

    const nomDInstance = "DiscussionPage"
    const verbose = false

    const listeMessageEmis = [
        "discuss_list_request",
        "messages_get_request",
        "users_search_request",
        "message_send_request",
        "discuss_remove_member_request",
    ]
    const listeMessageRecus = [
        "discuss_list_response",
        "messages_get_response",
        "users_search_response",
        "message_send_response",
        "discuss_remove_member_response",
    ]

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            console.log("DEBUG: DiscussionPage - currentUser", currentUser)

            if (verbose || controleur?.verboseall) {
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            }

            if (msg.discuss_list_response) {
                if (!msg.discuss_list_response.etat) {
                    setError(
                        `Erreur: ${
                            msg.discuss_list_response.error || "Inconnu"
                        }`
                    )
                } else {
                    const discussions = msg.discuss_list_response.messages || []
                    // Trier les discussions pour avoir les plus récentes en premier
                    const sortedDiscussions =
                        sortDiscussionsByLatestMessage(discussions)
                    setDiscussions(sortedDiscussions)
                }
            }

            if (msg.messages_get_response) {
                if (!msg.messages_get_response.etat) {
                    setError(
                        `Erreur: ${
                            msg.messages_get_response.error || "Inconnu"
                        }`
                    )
                } else {
                    setMessages(msg.messages_get_response.messages || [])
                }
            }

            if (msg.users_search_response) {
                if (!msg.users_search_response.etat) {
                    setError(
                        `Erreur: ${
                            msg.users_search_response.error || "Inconnu"
                        }`
                    )
                } else {
                    setSearchResults(msg.users_search_response.users || [])
                }
            }

            if (msg.message_send_response) {
                if (!msg.message_send_response.etat) {
                    setError(
                        `Erreur: ${
                            msg.message_send_response.error || "Inconnu"
                        }`
                    )
                } else {
                    fetchDiscussions() // Rafraîchir la liste des discussions

                    // Rafraîchir les messages de la discussion actuelle
                    if (selectedDiscussion) {
                        const messageGetRequest = {
                            messages_get_request: {
                                convId: selectedDiscussion,
                            },
                        }
                        controleur.envoie(handler, messageGetRequest)
                    }

                    setShowCreateDiscussion(false)
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal && currentUser) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
            fetchDiscussions()
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
    }, [controleur, canal, currentUser])

    // Ajout d'un nouvel useEffect pour gérer les mises à jour des discussions
    useEffect(() => {
        const handleDiscussionUpdate = (event: CustomEvent) => {
            const { discussionId, lastMessage } = event.detail

            setDiscussions((prevDiscussions) => {
                // Mettre à jour la discussion concernée avec le dernier message
                const updatedDiscussions = prevDiscussions.map((disc) => {
                    if (disc.discussion_uuid === discussionId) {
                        return {
                            ...disc,
                            last_message: lastMessage,
                        }
                    }
                    return disc
                })

                // Re-trier les discussions pour que la plus récente soit en premier
                return sortDiscussionsByLatestMessage(updatedDiscussions)
            })
        }

        document.addEventListener(
            "discussion-updated",
            handleDiscussionUpdate as EventListener
        )

        return () => {
            document.removeEventListener(
                "discussion-updated",
                handleDiscussionUpdate as EventListener
            )
        }
    }, [])

    const fetchDiscussions = () => {
        if (!currentUser) return

        try {
            // Compatibilité avec les deux types d'ID
            const userId = currentUser.id

            const message = { discuss_list_request: userId }
            controleur.envoie(handler, message)
        } catch (err) {
            setError("Erreur lors de la récupération des discussions.")
        }
    }

    const handleSelectDiscussion = (discussionId: string) => {
        setSelectedDiscussion(discussionId)
        setShowCreateDiscussion(false)
        if (controleur && currentUser) {
            const message = {
                messages_get_request: {
                    convId: discussionId,
                },
            }
            controleur.envoie(handler, message)
        }
    }

// Fonction à modifier dans FRONTEND/app/discussion/page.tsx

const handleRemoveDiscussion = (discussionId: string) => {
    if (!currentUser) return;
    
    setDiscussions((prev) =>
        prev.filter((d) => d.discussion_uuid !== discussionId)
    );
    
    // Si la discussion qu'on supprime est celle qui est actuellement sélectionnée,
    // on désélectionne
    if (selectedDiscussion === discussionId) {
        setSelectedDiscussion(null);
        setMessages([]);
    }
    
    setShowCreateDiscussion(false);
    
    if (controleur && currentUser) {
        const message = {
            discuss_remove_member_request: [
                currentUser.id, // userId
                discussionId  // discussionId
            ],
        };
        controleur.envoie(handler, message);
    }
}

    const toggleCreateDiscussion = () => {
        setShowCreateDiscussion(!showCreateDiscussion)
    }


    if (!currentUser) {
        return <div>Chargement...</div>
    }

    return (
        <div className="discussionContainer">
            <div className="sidebar">
                {error && <div className="error">{error}</div>}
                <DiscussionsList
                    discussions={discussions}
                    currentUserId={currentUser.id || ""}
                    currentUserEmail={currentUser.email || ""} // Add the email prop
                    onSelectDiscussion={handleSelectDiscussion}
                    selectedDiscussionId={selectedDiscussion}
                    onNewDiscussClick={toggleCreateDiscussion}
                    removeDiscussion={handleRemoveDiscussion}
                />
            </div>
            <div
                className="createDiscuss"
                style={{ display: showCreateDiscussion ? "block" : "none" }}
            >
                <CreateDiscussion
                    onDiscussionCreated={fetchDiscussions}
                    searchResults={searchResults}
                    controleur={controleur}
                    handler={handler}
                />
            </div>
            <div
                className="chatArea"
                style={{ display: showCreateDiscussion ? "none" : "flex" }}
            >
                {selectedDiscussion ? (
                    <ChatWindow
                        discussion={discussions.find(
                            (d) => d.discussion_uuid === selectedDiscussion
                        )}
                        messages={messages}
                        currentUser={currentUser}
                    />
                ) : (
                    <div className="no-chat-selected">
                        Sélectionnez une discussion pour commencer
                    </div>
                )}
            </div>
        </div>
    )
}
