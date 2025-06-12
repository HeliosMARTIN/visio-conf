"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import type { Discussion } from "@/types/Discussion";
import type { Message } from "@/types/Message";
import { CreateDiscussion } from "@/components/discussion/Create/page";
import DiscussionsList from "@/components/discussion/DiscussList/DiscussList";
import ChatWindow from "@/components/discussion/ChatWindow/ChatWindow";
import { sortDiscussionsByLatestMessage } from "@/utils/discussion";
import "./discussion.css";

export default function DiscussionPage() {
    const { controleur, canal, currentUser } = useAppContext();
    const router = useRouter();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(
        null
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState("");
    const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const nomDInstance = "DiscussionPage";
    const verbose = false;

    const listeMessageEmis = [
        "discuss_list_request",
        "messages_get_request",
        "users_search_request",
        "message_send_request",
        "discuss_remove_member_request",
    ];
    const listeMessageRecus = [
        "discuss_list_response",
        "messages_get_response",
        "users_search_response",
        "message_send_response",
        "discuss_remove_member_response",
        "message_received",
    ];

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            console.log("DiscussionPage - Message reçu:", msg);

            if (msg.discuss_list_response) {
                if (msg.discuss_list_response.etat) {
                    const discussions =
                        msg.discuss_list_response.discussList || [];
                    const sortedDiscussions =
                        sortDiscussionsByLatestMessage(discussions);
                    setDiscussions(sortedDiscussions);
                } else {
                    setError("Erreur lors de la récupération des discussions");
                }
            }

            if (msg.messages_get_response) {
                console.log(
                    "DiscussionPage - Messages get response:",
                    msg.messages_get_response
                );
                if (msg.messages_get_response.etat) {
                    console.log(
                        "DiscussionPage - Mise à jour des messages avec la réponse:",
                        msg.messages_get_response.messages
                    );
                    setMessages(msg.messages_get_response.messages || []);
                }
            }

            if (msg.message_send_response) {
                console.log(
                    "DiscussionPage - Message send response:",
                    msg.message_send_response
                );
                if (msg.message_send_response.etat) {
                    const sentMessage = msg.message_send_response.message;
                    console.log(
                        "DiscussionPage - Message envoyé:",
                        sentMessage
                    );

                    // Mettre à jour les messages si c'est pour la discussion actuelle
                    if (selectedDiscussion === sentMessage.discussion_uuid) {
                        setMessages((prevMessages) => {
                            const messageExists = prevMessages.some(
                                (m) =>
                                    m.message_uuid === sentMessage.message_uuid
                            );

                            if (messageExists) {
                                return prevMessages.map((m) =>
                                    m.message_uuid === sentMessage.message_uuid
                                        ? {
                                              ...sentMessage,
                                              message_status: "sent",
                                          }
                                        : m
                                );
                            } else {
                                return [
                                    ...prevMessages,
                                    { ...sentMessage, message_status: "sent" },
                                ];
                            }
                        });
                    }

                    // Toujours mettre à jour la liste des discussions
                    setDiscussions((prevDiscussions) => {
                        const updatedDiscussions = prevDiscussions.map(
                            (disc) => {
                                if (
                                    disc.discussion_uuid ===
                                    sentMessage.discussion_uuid
                                ) {
                                    return {
                                        ...disc,
                                        lastMessage:
                                            sentMessage.message_content,
                                        lastMessageDate:
                                            sentMessage.message_date_create,
                                    };
                                }
                                return disc;
                            }
                        );
                        return sortDiscussionsByLatestMessage(
                            updatedDiscussions
                        );
                    });
                }
            }

            if (msg.message_received) {
                console.log(
                    "DiscussionPage - Message reçu:",
                    msg.message_received
                );
                const receivedMessage = msg.message_received.message;
                console.log(
                    "DiscussionPage - Message reçu détaillé:",
                    receivedMessage
                );

                // Si c'est pour la discussion actuelle, mettre à jour les messages
                if (
                    selectedDiscussion &&
                    selectedDiscussion === receivedMessage.discussion_uuid
                ) {
                    console.log(
                        "DiscussionPage - Mise à jour des messages pour la discussion actuelle"
                    );
                    setMessages((prevMessages) => {
                        // Vérifier si le message existe déjà
                        const messageExists = prevMessages.some(
                            (m) =>
                                m.message_uuid === receivedMessage.message_uuid
                        );

                        if (messageExists) {
                            console.log(
                                "DiscussionPage - Message déjà présent, pas de mise à jour"
                            );
                            return prevMessages;
                        }

                        // Ajouter le nouveau message
                        const updatedMessages = [
                            ...prevMessages,
                            { ...receivedMessage, message_status: "received" },
                        ];
                        console.log(
                            "DiscussionPage - Nouveaux messages:",
                            updatedMessages
                        );
                        return updatedMessages;
                    });

                    // Créer une notification si la fenêtre n'est pas active
                    if (!document.hasFocus()) {
                        console.log(
                            "DiscussionPage - Création d'une notification"
                        );
                        createNotification({
                            type: "message",
                            title: `${receivedMessage.message_sender.firstname} ${receivedMessage.message_sender.lastname}`,
                            message: receivedMessage.message_content,
                            priority: "medium",
                            duration: 5000,
                            onClick: () => {
                                console.log(
                                    "DiscussionPage - Notification cliquée, focus de la fenêtre"
                                );
                                window.focus();
                            },
                        });
                    }
                }

                // Mettre à jour la liste des discussions
                setDiscussions((prevDiscussions) => {
                    const updatedDiscussions = prevDiscussions.map((disc) => {
                        if (
                            disc.discussion_uuid ===
                            receivedMessage.discussion_uuid
                        ) {
                            return {
                                ...disc,
                                lastMessage: receivedMessage.message_content,
                                lastMessageDate:
                                    receivedMessage.message_date_create,
                            };
                        }
                        return disc;
                    });
                    return sortDiscussionsByLatestMessage(updatedDiscussions);
                });

                // Rafraîchir la liste complète des discussions en arrière-plan
                console.log(
                    "DiscussionPage - Rafraîchissement de la liste des discussions"
                );
                fetchDiscussions();
            }

            if (msg.message_status_response) {
                console.log(
                    "Message status response:",
                    msg.message_status_response
                );
                if (msg.message_status_response.etat) {
                    // Mettre à jour le statut des messages
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.message_status === "sent" ||
                            msg.message_status === "received"
                                ? { ...msg, message_status: "read" }
                                : msg
                        )
                    );
                }
            }

            if (msg.users_search_response) {
                if (msg.users_search_response.etat) {
                    setSearchResults(msg.users_search_response.users || []);
                }
            }
        },
    };

    // S'abonner au contrôleur au chargement du composant
    useEffect(() => {
        if (controleur && currentUser) {
            // S'abonner au contrôleur
            controleur.inscription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            );

            // Initialiser la connexion
            initializeConnection();

            // Se désabonner au démontage du composant
            return () => {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                );
            };
        }
    }, [controleur, currentUser]);

    // Charger les messages quand on change de discussion
    useEffect(() => {
        if (selectedDiscussion && controleur) {
            const message = {
                messages_get_request: {
                    convId: selectedDiscussion,
                },
            };
            controleur.envoie(handler, message);
        }
    }, [selectedDiscussion, controleur]);

    const initializeConnection = async () => {
        try {
            if (!currentUser) {
                setIsAuthenticated(false);
                return;
            }

            // S'assurer que l'utilisateur est bien authentifié
            setIsAuthenticated(true);

            // Récupérer les discussions
            fetchDiscussions();
        } catch (error) {
            console.error("Erreur lors de l'initialisation:", error);
            setError("Erreur lors de l'initialisation de la connexion");
        }
    };

    const fetchDiscussions = () => {
        if (!currentUser) return;

        try {
            // Compatibilité avec les deux types d'ID
            const userId = currentUser.id;

            const message = { discuss_list_request: userId };
            controleur.envoie(handler, message);
        } catch (err) {
            setError("Erreur lors de la récupération des discussions.");
        }
    };

    const handleSelectDiscussion = (discussionId: string) => {
        console.log(
            "DiscussionPage - Sélection de la discussion:",
            discussionId
        );
        console.log("DiscussionPage - Discussions disponibles:", discussions);

        // Vérifier si la discussion existe
        const discussionExists = discussions.some(
            (d) => d.discussion_uuid === discussionId
        );
        console.log("DiscussionPage - La discussion existe:", discussionExists);

        if (discussionExists) {
            console.log("DiscussionPage - Mise à jour de selectedDiscussion");
            setSelectedDiscussion(discussionId);
            setShowCreateDiscussion(false);

            if (controleur && currentUser) {
                console.log(
                    "DiscussionPage - Demande des messages pour la discussion"
                );
                const message = {
                    messages_get_request: {
                        convId: discussionId,
                    },
                };
                controleur.envoie(handler, message);
            }
        } else {
            console.log(
                "DiscussionPage - Discussion non trouvée, réinitialisation"
            );
            setSelectedDiscussion(null);
            setMessages([]);
        }
    };

    // Fonction améliorée dans FRONTEND/app/discussion/page.tsx

    const handleRemoveDiscussion = (discussionId: string) => {
        if (!currentUser) return;

        // Vérifions d'abord si la discussion existe
        const discussionToRemove = discussions.find(
            (d) => d.discussion_uuid === discussionId
        );
        if (!discussionToRemove) return;

        // Préparer le message pour le backend
        if (controleur && currentUser) {
            // Envoi de la demande au serveur avant de modifier l'interface
            const message = {
                discuss_remove_member_request: [
                    currentUser.id, // userId
                    discussionId, // discussionId
                ],
            };

            controleur.envoie(handler, message);

            // Mettre à jour l'interface utilisateur après l'envoi
            setDiscussions((prev) =>
                prev.filter((d) => d.discussion_uuid !== discussionId)
            );

            // Si la discussion supprimée est celle actuellement sélectionnée
            if (selectedDiscussion === discussionId) {
                setSelectedDiscussion(null);
                setMessages([]);
            }

            // Fermer la fenêtre de création si elle est ouverte
            setShowCreateDiscussion(false);

            // Afficher une notification de succès (optionnel)
            setError(""); // Effacer les erreurs précédentes

            // Vous pourriez ajouter ici une notification temporaire
            const successElement = document.createElement("div");
            successElement.className = "success-notification";
            successElement.textContent = "Vous avez quitté la conversation";
            document.body.appendChild(successElement);

            // Supprimer la notification après quelques secondes
            setTimeout(() => {
                if (document.body.contains(successElement)) {
                    document.body.removeChild(successElement);
                }
            }, 3000);
        }
    };

    const toggleCreateDiscussion = () => {
        setShowCreateDiscussion(!showCreateDiscussion);
    };

    const removeDiscussion = (discussionId: string) => {
        setDiscussions((prevDiscussions) =>
            prevDiscussions.filter(
                (disc) => disc.discussion_uuid !== discussionId
            )
        );
    };

    const handleMessageUpdate = (updatedMessages: Message[]) => {
        setMessages(updatedMessages);

        // Mettre à jour la liste des discussions si nécessaire
        if (updatedMessages.length > 0) {
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            setDiscussions((prevDiscussions) => {
                const updatedDiscussions = prevDiscussions.map((disc) => {
                    if (disc.discussion_uuid === lastMessage.discussion_uuid) {
                        return {
                            ...disc,
                            lastMessage: lastMessage.message_content,
                            lastMessageDate: lastMessage.message_date_create,
                        };
                    }
                    return disc;
                });
                return sortDiscussionsByLatestMessage(updatedDiscussions);
            });
        }
    };

    if (!currentUser || !isAuthenticated) {
        return (
            <div className="loading-container">
                <div className="loading-message">
                    {!currentUser
                        ? "Chargement de votre profil..."
                        : "Reconnexion en cours..."}
                </div>
            </div>
        );
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
                        onMessageUpdate={handleMessageUpdate}
                    />
                ) : (
                    <div className="no-chat-selected">
                        Sélectionnez une discussion pour commencer
                    </div>
                )}
            </div>
        </div>
    );
}
