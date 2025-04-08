"use client";

import React from "react";
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
}

// Modifier la déclaration du composant pour inclure currentUserEmail
const DiscussionsList: React.FC<DiscussionsListProps> = ({
    discussions = [],
    currentUserId,
    currentUserEmail, // Ajout du prop
    onSelectDiscussion,
    selectedDiscussionId,
    onNewDiscussClick
}) => {
    console.log("Rendering DiscussionsList", discussions);
    const getDiscussionName = (discussion: Discussion): string => {
        // Initial debug logs
        console.log('=== GetDiscussionName Debug ===');
        console.log('Discussion:', discussion);
        console.log('CurrentUserId:', currentUserId);

        // Vérification de sécurité
        if (!discussion || !discussion.discussion_members) {
            console.log('Discussion or members missing:', { discussion });
            return "Discussion sans nom";
        }

        if (discussion.discussion_type === "group" && discussion.discussion_name) {
            console.log('Group discussion with name:', discussion.discussion_name);
            return discussion.discussion_name;
        }

        // Vérification que discussion_members est un tableau
        if (!Array.isArray(discussion.discussion_members)) {
            console.log('Discussion members is not an array:', discussion.discussion_members);
            return "Discussion sans nom";
        }

        console.log('Discussion members:', discussion.discussion_members);

        const otherMembers = discussion.discussion_members
        .filter(member => {
            console.log('Filtering member:', {
                member,
                memberId: member._id,
                currentUserId,
                isOtherMember: member._id !== currentUserId
            });
            return member && member._id !== currentUserId;
        })
        .map(member => {
            console.log('Mapping member name:', `${member.firstname} ${member.lastname}`);
            return `${member.firstname} ${member.lastname}`;
        })
        .join(", ");

        console.log('Final other members:', otherMembers);
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