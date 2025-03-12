"use client";

import React from "react";
import { Discussion } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import "./DiscussList.css";
import { FilePlus2 } from "lucide-react"

interface DiscussionsListProps {
    discussions: Discussion[];
    currentUserId: string;
    onSelectDiscussion: (discussionId: string) => void;
    selectedDiscussionId: string | null;
    onNewDiscussClick: () => void;
}

const DiscussionsList: React.FC<DiscussionsListProps> = ({
    discussions = [],
    currentUserId,
    onSelectDiscussion,
    selectedDiscussionId,
    onNewDiscussClick
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
            .filter(member => member && member._id !== currentUserId)
            .map(member => `${member.firstname} ${member.lastname}`)
            .join(", ");

        return otherMembers || "Discussion sans nom";
    };

    const formatDate = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: fr
            });
        } catch (error) {
            return "";
        }
    };
    

    if (!Array.isArray(discussions)) {
        return <p className="no-discussions">Aucune discussion disponible.</p>;
    }

    return (
        <div className="discussions-list">
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