"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import type { Discussion } from "@/types/Discussion"
import type { Message } from "@/types/Message"
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
    const [newlyCreatedDiscussionId, setNewlyCreatedDiscussionId] = useState<
        string | null
    >(null)

    const nomDInstance = "DiscussionPage"
    const verbose = false

    const listeMessageEmis = [
        "discuss_list_request",
        "messages_get_request",
        "users_search_request",
        "message_send_request",
        "discuss_remove_member_request",
        "message_status_update_request", // Pour marquer les messages comme lus
    ]
    const listeMessageRecus = [
        "discuss_list_response",
        "messages_get_response",
        "users_search_response",
        "message_send_response",
        "discuss_remove_member_response",
        "message_status_update_response",
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

                    // Gérer la sélection automatique après création ou réception de message
                    if (newlyCreatedDiscussionId) {
                        // Si on vient de créer une discussion, la sélectionner automatiquement
                        const createdDiscussion = sortedDiscussions.find(
                            (d) =>
                                d.discussion_uuid === newlyCreatedDiscussionId
                        )
                        if (createdDiscussion) {
                            setSelectedDiscussion(newlyCreatedDiscussionId)
                            setNewlyCreatedDiscussionId(null)

                            // Charger les messages de la nouvelle discussion
                            const message = {
                                messages_get_request: {
                                    convId: newlyCreatedDiscussionId,
                                },
                            }
                            controleur.envoie(handler, message)
                        }
                    }
                    // Si aucune discussion n'est sélectionnée mais qu'on a reçu des discussions
                    // et qu'on n'est pas en train de créer, garder la sélection actuelle ou ne rien faire
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
                    // Marquer qu'on vient de créer une discussion si on était en mode création
                    if (showCreateDiscussion) {
                        // Stocker l'UUID de la discussion créée (on devra le récupérer du backend)
                        // Pour l'instant on va rafraîchir et sélectionner la première discussion
                        setShowCreateDiscussion(false)
                        // Marquer qu'on doit sélectionner une nouvelle discussion après le reload
                        setNewlyCreatedDiscussionId("NEW_DISCUSSION")
                    }

                    fetchDiscussions() // Rafraîchir la liste des discussions

                    // Rafraîchir les messages de la discussion actuelle seulement si on était déjà dans une discussion
                    if (selectedDiscussion && !showCreateDiscussion) {
                        const messageGetRequest = {
                            messages_get_request: {
                                convId: selectedDiscussion,
                            },
                        }
                        controleur.envoie(handler, messageGetRequest)
                    }
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal && currentUser) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
            fetchDiscussions()

            // Récupérer l'ID de discussion depuis l'URL si présent
            const urlParams = new URLSearchParams(window.location.search)
            const discussionId = urlParams.get("id")

            if (discussionId) {
                setSelectedDiscussion(discussionId)
                const message = {
                    messages_get_request: {
                        convId: discussionId,
                    },
                }
                controleur.envoie(handler, message)
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

        const message = {
            messages_get_request: {
                convId: discussionId,
            },
        }
        controleur.envoie(handler, message)
    }

    // Fonction améliorée dans FRONTEND/app/discussion/page.tsx

    const handleRemoveDiscussion = (discussionId: string) => {
        if (!currentUser) return

        // Vérifions d'abord si la discussion existe
        const discussionToRemove = discussions.find(
            (d) => d.discussion_uuid === discussionId
        )
        if (!discussionToRemove) return

        // Préparer le message pour le backend
        if (controleur && currentUser) {
            // Envoi de la demande au serveur avant de modifier l'interface
            const message = {
                discuss_remove_member_request: [
                    currentUser.id, // userId
                    discussionId, // discussionId
                ],
            }

            controleur.envoie(handler, message)

            // Mettre à jour l'interface utilisateur après l'envoi
            setDiscussions((prev) =>
                prev.filter((d) => d.discussion_uuid !== discussionId)
            )

            // Si la discussion supprimée est celle actuellement sélectionnée
            if (selectedDiscussion === discussionId) {
                setSelectedDiscussion(null)
                setMessages([])
            }

            // Fermer la fenêtre de création si elle est ouverte
            setShowCreateDiscussion(false)

            // Afficher une notification de succès (optionnel)
            setError("") // Effacer les erreurs précédentes

            // Vous pourriez ajouter ici une notification temporaire
            const successElement = document.createElement("div")
            successElement.className = "success-notification"
            successElement.textContent = "Vous avez quitté la conversation"
            document.body.appendChild(successElement)

            // Supprimer la notification après quelques secondes
            setTimeout(() => {
                if (document.body.contains(successElement)) {
                    document.body.removeChild(successElement)
                }
            }, 3000)
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
                {error && <div className="error">{error}</div>}{" "}
                <DiscussionsList
                    discussions={discussions}
                    currentUserId={currentUser.id || ""}
                    currentUserEmail={currentUser.email || ""}
                    onSelectDiscussion={handleSelectDiscussion}
                    selectedDiscussionId={selectedDiscussion}
                    onNewDiscussClick={toggleCreateDiscussion}
                    removeDiscussion={handleRemoveDiscussion}
                />
            </div>
            <div
                className="createDiscuss"
                style={{ display: showCreateDiscussion ? "flex" : "none" }}
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
