"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";
import { Discussion, Message } from "@/types";
import { CreateDiscussion } from "@/components/discussion/Create/page";
import DiscussionsList from "@/components/discussion/DiscussList/DiscussList";
import ChatWindow from "@/components/discussion/ChatWindow/ChatWindow";
import { sortDiscussionsByLatestMessage } from "@/utils/discussion";
import "./discussion.css";

export default function DiscussionPage() {
    const { controleur, canal, currentUser } = useSocket();
    const router = useRouter();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState("");
    const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const nomDInstance = "DiscussionPage";
    const verbose = false;

    const listeMessageEmis = [
        "discuss_list_request", 
        "messages_get_request",
        "users_shearch_request",
        "message_send_request"
    ];
    const listeMessageRecus = [
        "discuss_list_response", 
        "messages_get_response",
        "users_shearch_response",
        "message_send_response"
    ];

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall) {
                console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);
            }

            if (msg.discuss_list_response) {
                if (!msg.discuss_list_response.etat) {
                    setError(`Erreur: ${msg.discuss_list_response.error || "Inconnu"}`);
                } else {
                    const discussions = msg.discuss_list_response.messages || [];
                    // Trier les discussions pour avoir les plus récentes en premier
                    const sortedDiscussions = sortDiscussionsByLatestMessage(discussions);
                    setDiscussions(sortedDiscussions);
                }
            }

            if (msg.messages_get_response) {
                if (!msg.messages_get_response.etat) {
                    setError(`Erreur: ${msg.messages_get_response.error || "Inconnu"}`);
                } else {
                    setMessages(msg.messages_get_response.messages || []);
                }
            }

            if (msg.users_shearch_response) {
                if (!msg.users_shearch_response.etat) {
                    setError(`Erreur: ${msg.users_shearch_response.error || "Inconnu"}`);
                } else {
                    setSearchResults(msg.users_shearch_response.users || []);
                }
            }

            if (msg.message_send_response) {
                if (!msg.message_send_response.etat) {
                    setError(`Erreur: ${msg.message_send_response.error || "Inconnu"}`);
                } else {
                    fetchDiscussions(); // Rafraîchir la liste des discussions après création
                    setShowCreateDiscussion(false); // Fermer la fenêtre de création
                }
            }
        }
    };

    useEffect(() => {
        if (controleur && canal && currentUser) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
            fetchDiscussions();
        }

        return () => {
            if (controleur) {
                controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
            }
        };
    }, [controleur, canal, currentUser]);

    // Ajout d'un nouvel useEffect pour gérer les mises à jour des discussions
    useEffect(() => {
        const handleDiscussionUpdate = (event: CustomEvent) => {
            const { discussionId, lastMessage } = event.detail;
            
            setDiscussions(prevDiscussions => {
                // Mettre à jour la discussion concernée avec le dernier message
                const updatedDiscussions = prevDiscussions.map(disc => {
                    if (disc.discussion_uuid === discussionId) {
                        return {
                            ...disc,
                            last_message: lastMessage
                        };
                    }
                    return disc;
                });
                
                // Re-trier les discussions pour que la plus récente soit en premier
                return sortDiscussionsByLatestMessage(updatedDiscussions);
            });
        };

        document.addEventListener('discussion-updated', handleDiscussionUpdate as EventListener);
        
        return () => {
            document.removeEventListener('discussion-updated', handleDiscussionUpdate as EventListener);
        };
    }, []);

    const fetchDiscussions = () => {
        if (!currentUser) return;
        
        try {
            const message = { discuss_list_request: currentUser.userId };
            controleur.envoie(handler, message);
        } catch (err) {
            setError("Erreur lors de la récupération des discussions.");
        }
    };

    const handleSelectDiscussion = (discussionId: string) => {
        setSelectedDiscussion(discussionId);
        setShowCreateDiscussion(false);
        if (controleur && currentUser) {
            const message = {
                messages_get_request: {
                    convId: discussionId
                }
            };
            controleur.envoie(handler, message);
        }
    };

    const toggleCreateDiscussion = () => {
        setShowCreateDiscussion(!showCreateDiscussion);
    };

    if (!currentUser) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="discussionContainer">
            <div className="sidebar">
                {error && <div className="error">{error}</div>}
                <DiscussionsList 
                    discussions={discussions}
                    currentUserId={currentUser.userId}
                    onSelectDiscussion={handleSelectDiscussion}
                    selectedDiscussionId={selectedDiscussion}
                    onNewDiscussClick={toggleCreateDiscussion}
                />
            </div>
            <div className="createDiscuss" style={{ display: showCreateDiscussion ? 'block' : 'none' }}>
                <CreateDiscussion 
                    onDiscussionCreated={fetchDiscussions}
                    searchResults={searchResults}
                    controleur={controleur}
                    handler={handler}
                />
            </div>
            <div className="chatArea" style={{ display: showCreateDiscussion ? 'none' : 'flex' }}>
                {selectedDiscussion ? (
                    <ChatWindow
                        discussion={discussions.find(d => d.discussion_uuid === selectedDiscussion)}
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
    );
}