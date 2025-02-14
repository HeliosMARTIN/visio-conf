"use client"

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { CreateDiscussion } from "../../components/discussion/Create/page";
import DiscussionsList from "../../components/discussion/DiscussList/DiscussList";
import "./discussion.css";

interface Discussion {
    discussion_uuid: string;
    discussion_name: string;
    discussion_description: string;
    discussion_type: string;
    discussion_date_create: string;
}

export default function DiscussionPage() {
    const { currentUser, controleur } = useSocket();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (currentUser && controleur) {
            fetchDiscussions();
        }
    }, [currentUser, controleur]);

    const fetchDiscussions = () => {
        try {
            const message = { discuss_list_request: currentUser.email };
            controleur.envoie({
                nomDInstance: "DiscussionPage",
                traitementMessage: (msg: { discuss_list_response?: { etat: boolean; messages?: Discussion[] } }) => {
                    if (msg.discuss_list_response) {
                        if (!msg.discuss_list_response.etat) {
                            setError("Failed to fetch discussions");
                        } else {
                            setDiscussions(msg.discuss_list_response.messages || []);
                        }
                    }
                }
            }, message);
        } catch (err) {
            setError("Failed to fetch discussions. Please try again.");
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="discussionContainer">
            <div className="listMessages">
                <h1>Messages pour {currentUser.firstname}</h1>
                {error && <div className="error">{error}</div>}
                <DiscussionsList discussions={discussions} />
            </div>
            <div className="chat">
                <CreateDiscussion />
            </div>
        </div>
    );
}
