"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { Discussion } from "@/types/Discussion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import "./DiscussList.css";
import { FilePlus2 } from "lucide-react"
import { get } from "http";

// Modifier d'abord l'interface pour accepter l'email
interface DiscussionsListProps {
    discussions: Discussion[];
    currentUserId: string;
    currentUserEmail: string; // Ajout de l'email
    onSelectDiscussion: (discussionId: string) => void;
    selectedDiscussionId: string | null;
    onNewDiscussClick: () => void;
    removeDiscussion: (discussionId: string) => void;
}

// Modifier la déclaration du composant pour inclure currentUserEmail
const DiscussionsList: React.FC<DiscussionsListProps> = ({
    discussions = [],
    currentUserId,
    currentUserEmail,
    onSelectDiscussion,
    selectedDiscussionId,
    onNewDiscussClick,
    removeDiscussion
}) => {
    const getDiscussionName = (discussion: Discussion): string => {

        // Vérification de sécurité
        if (!discussion || !discussion.discussion_members) {
            return "Discussion sans nom";
        }

        if (discussion.discussion_type === "group" && discussion.discussion_name) {
            return discussion.discussion_name;
        }

        // Vérification que discussion_members est un tableau
        if (!Array.isArray(discussion.discussion_members)) {
            return "Discussion sans nom";
        }


        const otherMembers = discussion.discussion_members
        .filter(member => {
            return member && member._id !== currentUserId;
        })
        .map(member => {
            return `${member.firstname} ${member.lastname}`;
        })
        .join(", ");

        return otherMembers || "Discussion sans nom";
    };
    const formatDate = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: false,
                locale: fr
            });
            
        } catch (error) {
            return "";
        }
    };
    

    if (!Array.isArray(discussions)) {
        return <p className="no-discussions">Aucune discussion disponible.</p>;
    }



    const customMenuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [selectedMenuDiscussionId, setSelectedMenuDiscussionId] = useState<string | null>(null);

    useEffect(() => {
        const handleClick = () => setIsMenuVisible(false);
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, discussionId: string) => {
        e.preventDefault();
        setSelectedMenuDiscussionId(discussionId);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setIsMenuVisible(true);
    };

    return (
        <div className="discussions-list">
            {isMenuVisible && (
                <div
                    className="custom-menu"
                    ref={customMenuRef}
                    style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, position: 'absolute', display: 'block', zIndex: 1000 }}
                >
                    <button onClick={() => {
                        if (selectedMenuDiscussionId) {
                            removeDiscussion(selectedMenuDiscussionId);
                        }
                        setIsMenuVisible(false);
                    }}>
                        Supprimer la conversation
                    </button>
                </div>
            )}
            <h1>Messages <span>({discussions.length})</span></h1>
            <div className="search-bar">
                <input placeholder="Rechercher une conversation..." type="text" /> 
                <FilePlus2 
                    className="new-discuss" 
                    strokeWidth={1.5} 
                    color="#636363" 
                    size={26} 
                    onClick={onNewDiscussClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
            <div>
                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div
                            key={discussion?.discussion_uuid || Math.random()}
                            className={`discussion-item ${selectedDiscussionId === discussion?.discussion_uuid ? 'selected' : ''}`}
                            onClick={() => discussion?.discussion_uuid && onSelectDiscussion(discussion.discussion_uuid)}
                            onContextMenu={(e) => handleContextMenu(e, discussion.discussion_uuid)}
                        >
                            <img src="/images/default_profile_picture.png" alt="" />
                            <div className="discussion-item-content">
                                <div className="discussion-header">
                                    <h3>{getDiscussionName(discussion)}</h3>
                                    {discussion?.last_message && (
                                        <span className="discussion-date">
                                            {formatDate(discussion.last_message.message_date_create)}
                                        </span>
                                    )}
                                </div>
                                <p className="discussion-preview">
                                    {discussion?.last_message?.message_content ||
                                        "Pas de messages"
                                    }
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-discussions">Aucune discussion trouvée.</p>
                )}
            </div>
        </div>
    );
};

export default DiscussionsList;