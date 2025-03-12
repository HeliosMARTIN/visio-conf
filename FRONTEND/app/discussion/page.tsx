"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";
import { User } from "../../types/User";
import { CreateDiscussion } from "../../components/discussion/Create/page";
import DiscussionsList from "../../components/discussion/DiscussList/DiscussList";
import "../discussion/discussion.css";

interface Discussion {
    discussion_uuid: string;
    discussion_name: string;
    discussion_description: string;
    discussion_type: string;
    discussion_date_create: string;
    discussion_members: User[]; // Ajout pour correspondre à DiscussList
}

export default function DiscussionPage() {
    const { controleur, canal, currentUser } = useSocket();
    const router = useRouter();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [error, setError] = useState("");

    const nomDInstance = "DiscussionPage";
    const verbose = false;

    const listeMessageEmis = ["discuss_list_request"];
    const listeMessageRecus = ["discuss_list_response"];

    const handler = {
        nomDInstance,
        traitementMessage: (msg: { discuss_list_response?: { etat: boolean; messages?: Discussion[], error?: string } }) => {
            if (verbose || controleur?.verboseall) {
                console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);
                console.log("Données reçues du serveur :", msg.discuss_list_response);
            }
            if (msg.discuss_list_response) {
                if (!msg.discuss_list_response.etat) {
                    setError(`Erreur lors de la récupération des discussions: ${msg.discuss_list_response.error || "Inconnu"}`);
                } else {
                    setDiscussions(msg.discuss_list_response.messages || []);
                    console.log("Discussions mises à jour :", msg.discuss_list_response.messages); // Log pour debug
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
    }, [router, controleur, canal, currentUser]);

    const fetchDiscussions = () => {
        if (!currentUser) return;
    
        try {
            const message = { discuss_list_request: currentUser.userId };
            console.log("Requête pour discussions avec l'ID:", currentUser.userId);
            controleur.envoie({ nomDInstance, traitementMessage: handler.traitementMessage }, message);
        } catch (err) {
            setError("Erreur lors de la récupération des discussions. Veuillez réessayer.");
        }
    };

    if (!currentUser) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="discussionContainer">
            <div className="listMessages">
                <h1>Messages pour {currentUser.firstname}</h1>
                {error && <div className="error">{error}</div>}
                <DiscussionsList discussions={discussions} currentUserId={currentUser.userId} />
            </div>
            <div className="chat">
                <CreateDiscussion />
            </div>
        </div>
    );
}
