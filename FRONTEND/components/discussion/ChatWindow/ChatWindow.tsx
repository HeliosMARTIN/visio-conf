"use client";

import React, { useState, useEffect, useRef } from "react";
import { Discussion } from "@/types/Discussion";
import { User } from "@/types/User";
import { Message } from "@/types/Message";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAppContext } from "@/context/AppContext";
import { v4 as uuidv4 } from "uuid";
import { useNotifications } from "@/components/notifications/NotificationSystem";
import { useAppDispatch } from "@/store/hooks";
import VideoCall from "../VideoCall/VideoCall";
import "./ChatWindow.css";

interface ChatWindowProps {
    discussion?: Discussion;
    messages: Message[];
    currentUser: User;
    onMessageUpdate: (messages: Message[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    discussion,
    messages,
    currentUser,
    onMessageUpdate,
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [isCallActive, setIsCallActive] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peerConnection, setPeerConnection] =
        useState<RTCPeerConnection | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { controleur } = useAppContext();
    const { createNotification } = useNotifications();
    const nomDInstance = "ChatWindow";
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const isEndingCallRef = useRef(false);
    const initializationAttemptedRef = useRef(false);

    // Log quand les messages changent
    useEffect(() => {
        console.log("ChatWindow - Messages mis à jour:", messages);
        console.log(
            "ChatWindow - Discussion actuelle:",
            discussion?.discussion_uuid
        );
    }, [messages, discussion]);

    const listeMessageEmis = [
        "webrtc_call_end",
        "webrtc_offer",
        "webrtc_answer",
        "webrtc_ice_candidate",
    ];
    const listeMessageRecus = [
        "webrtc_call_end",
        "webrtc_offer",
        "webrtc_answer",
        "webrtc_ice_candidate",
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
        console.log("ChatWindow - Scroll to bottom triggered");
        scrollToBottom();
    }, [messages]);

    // Marquer les messages comme lus quand on reçoit de nouveaux messages
    useEffect(() => {
        if (discussion && controleur && messages.length > 0) {
            // Vérifier s'il y a des messages non lus
            const hasUnreadMessages = messages.some(
                (m) =>
                    m.message_status === "received" ||
                    m.message_status === "sent"
            );

            if (hasUnreadMessages) {
                console.log("ChatWindow - Marquer les messages comme lus");
                const message = {
                    message_status_request: discussion.discussion_uuid,
                };
                controleur.envoie(handler, message);
            }
        }
    }, [messages, discussion, controleur]);

    // S'abonner au contrôleur
    useEffect(() => {
        if (controleur) {
            console.log("ChatWindow - Inscription aux messages WebRTC");
            controleur.inscription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            );
            return () => {
                console.log("ChatWindow - Désinscription des messages WebRTC");
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                );
            };
        }
    }, [controleur, isCallActive]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fonction utilitaire pour vérifier si un message provient de l'utilisateur actuel
    const isCurrentUserMessage = (message: Message): boolean => {
        return (
            message.message_sender.email?.toLowerCase() ===
            currentUser.email?.toLowerCase()
        );
    };

    const checkWebRTCSupport = () => {
        if (typeof window === "undefined") {
            console.log("ChatWindow - window is undefined");
            return false;
        }

        // Vérifier getUserMedia
        const hasGetUserMedia = !!(
            navigator.mediaDevices?.getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia ||
            (navigator as any).msGetUserMedia
        );
        console.log("ChatWindow - getUserMedia support:", hasGetUserMedia);
        console.log(
            "ChatWindow - navigator.mediaDevices:",
            !!navigator.mediaDevices
        );

        // Vérifier RTCPeerConnection
        const hasRTCPeerConnection = !!(
            window.RTCPeerConnection ||
            (window as any).webkitRTCPeerConnection ||
            (window as any).mozRTCPeerConnection
        );
        console.log(
            "ChatWindow - RTCPeerConnection support:",
            hasRTCPeerConnection
        );

        // Vérifier les APIs WebRTC spécifiques
        const hasWebRTC = !!(
            window.RTCIceCandidate &&
            window.RTCSessionDescription &&
            window.RTCPeerConnection
        );
        console.log("ChatWindow - WebRTC APIs support:", hasWebRTC);

        // Vérifier si nous sommes en HTTPS ou localhost
        const isSecureContext = window.isSecureContext;
        console.log("ChatWindow - Secure context:", isSecureContext);
        console.log("ChatWindow - Current protocol:", window.location.protocol);

        // Retourner true seulement si nous avons les fonctionnalités essentielles
        const isSupported =
            hasGetUserMedia && hasRTCPeerConnection && hasWebRTC;
        console.log("ChatWindow - WebRTC fully supported:", isSupported);

        if (!isSupported) {
            console.log("ChatWindow - WebRTC support check failed:");
            if (!hasGetUserMedia) console.log("- getUserMedia not supported");
            if (!hasRTCPeerConnection)
                console.log("- RTCPeerConnection not supported");
            if (!hasWebRTC) console.log("- WebRTC APIs not supported");
            if (!isSecureContext)
                console.log(
                    "- Not in secure context (HTTPS or localhost required)"
                );
        }

        return isSupported;
    };

    const initializeWebRTC = async () => {
        if (initializationAttemptedRef.current) {
            console.log("ChatWindow - Initialization already attempted");
            return;
        }
        initializationAttemptedRef.current = true;

        try {
            console.log("ChatWindow - Starting WebRTC initialization");
            console.log("ChatWindow - Browser info:", navigator.userAgent);

            if (!checkWebRTCSupport()) {
                throw new Error(
                    "WebRTC n'est pas supporté dans votre navigateur. " +
                        "Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Edge. " +
                        "Assurez-vous également d'être en HTTPS ou sur localhost."
                );
            }

            // Demander l'accès à la caméra et au micro
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setLocalStream(stream);

            // Configuration du peer connection
            const configuration = {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                ],
            };

            const pc = new RTCPeerConnection(configuration);
            setPeerConnection(pc);

            // Ajouter le stream local à la peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Gérer les candidats ICE
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("ChatWindow - Envoi candidat ICE");
                    controleur?.envoie(handler, {
                        webrtc_ice_candidate: {
                            discussion_uuid: discussion?.discussion_uuid,
                            candidate: event.candidate,
                            sender_uuid: currentUser?.user_uuid,
                        },
                    });
                }
            };

            // Gérer le stream distant
            pc.ontrack = (event) => {
                console.log("ChatWindow - Réception stream distant");
                // Le stream distant sera géré par VideoCall
            };

            // Créer et envoyer l'offre
            console.log("ChatWindow - Création offre");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            controleur?.envoie(handler, {
                webrtc_offer: {
                    discussion_uuid: discussion?.discussion_uuid,
                    offer: offer,
                    sender_uuid: currentUser?.user_uuid,
                },
            });

            setIsCallActive(true);
        } catch (error) {
            console.error("ChatWindow - Erreur initialisation:", error);
            let errorMessage =
                "Une erreur est survenue lors de l'initialisation de l'appel vidéo";

            if (error instanceof Error) {
                if (error.name === "NotAllowedError") {
                    errorMessage =
                        "L'accès à la caméra et au microphone a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.";
                } else if (error.name === "NotFoundError") {
                    errorMessage =
                        "Aucune caméra ou microphone n'a été trouvé sur votre appareil.";
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
            handleEndCall();
        }
    };

    const handleStartCall = async () => {
        console.log("ChatWindow - Démarrage de l'appel");
        setIsCallActive(true);
        isEndingCallRef.current = false;
        await initializeWebRTC();
    };

    const handleEndCall = () => {
        if (isEndingCallRef.current) return;
        console.log("ChatWindow - Fin de l'appel");
        isEndingCallRef.current = true;

        if (controleur) {
            controleur.envoie(handler, {
                webrtc_call_end: {
                    discussion_uuid: discussion?.discussion_uuid,
                    sender_uuid: currentUser?.user_uuid,
                },
            });
        }

        // Nettoyer les ressources
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }
        setIsCallActive(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !controleur || !currentUser || !discussion)
            return;

        const messageUuid = uuidv4();
        const currentDate = new Date();

        // Créer un message temporaire pour l'affichage immédiat
        const tempMessage: Message = {
            message_uuid: messageUuid,
            message_content: newMessage.trim(),
            message_date_create: currentDate.toISOString(),
            message_sender: {
                _id: currentUser._id,
                firstname: currentUser.firstname,
                lastname: currentUser.lastname,
                email: currentUser.email,
                picture: currentUser.picture,
            },
            message_status: "sending",
            discussion_uuid: discussion.discussion_uuid,
        };

        // Ajouter le message temporaire à la liste des messages immédiatement
        onMessageUpdate([...messages, tempMessage]);

        const message = {
            message_send_request: {
                userEmail: currentUser.email,
                discussion_uuid: discussion.discussion_uuid,
                message_uuid: messageUuid,
                message_content: newMessage.trim(),
                message_date_create: currentDate.toISOString(),
            },
        };

        try {
            // Vider le champ de saisie immédiatement
            setNewMessage("");
            // Envoyer le message
            controleur.envoie(handler, message);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            // En cas d'erreur, mettre à jour le statut du message temporaire
            onMessageUpdate(
                messages.map((m) =>
                    m.message_uuid === messageUuid
                        ? { ...m, message_status: "error" }
                        : m
                )
            );
            createNotification({
                type: "system",
                title: "Erreur d'envoi",
                message: "Une erreur est survenue lors de l'envoi du message",
                priority: "high",
            });
        }
    };

    const handler = {
        nomDInstance,
        traitementMessage: async (msg: any) => {
            console.log("ChatWindow - Message reçu:", msg);

            if (msg.webrtc_call_end) {
                // Ne pas traiter le message si c'est nous qui l'avons envoyé
                if (
                    msg.webrtc_call_end.sender_uuid === currentUser?.user_uuid
                ) {
                    return;
                }
                console.log(
                    "ChatWindow - Fin d'appel reçue de l'autre participant"
                );
                handleEndCall();
            } else if (msg.webrtc_offer && peerConnection) {
                // ... handle offer ...
            } else if (msg.webrtc_answer && peerConnection) {
                // ... handle answer ...
            } else if (msg.webrtc_ice_candidate && peerConnection) {
                // ... handle ice candidate ...
            }
        },
    };

    if (!discussion) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="chat-header">
                <h2>{discussion.discussion_name || "Discussion"}</h2>
                <div className="chat-actions">
                    <button
                        onClick={handleStartCall}
                        className="call-button"
                        title="Démarrer un appel vidéo"
                    >
                        📹
                    </button>
                </div>
            </div>

            {isCallActive && (
                <VideoCall
                    discussion={discussion}
                    currentUser={currentUser}
                    onEndCall={handleEndCall}
                    localStream={localStream}
                    peerConnection={peerConnection}
                    error={error}
                />
            )}

            <div className="chat-messages" ref={messagesEndRef}>
                {messages.map((message) => (
                    <div
                        key={message.message_uuid}
                        className={`message ${
                            isCurrentUserMessage(message) ? "sent" : "received"
                        }`}
                    >
                        <div className="message-content">
                            {message.message_content}
                        </div>
                        <div className="message-info">
                            <span className="sender-name">
                                {isCurrentUserMessage(message)
                                    ? "Vous"
                                    : `${message.message_sender.firstname} ${message.message_sender.lastname}`}
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
                        </div>
                    </div>
                ))}
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
    );
};

export default ChatWindow;
