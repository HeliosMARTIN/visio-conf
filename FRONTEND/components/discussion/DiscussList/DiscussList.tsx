"use client";

import React from "react";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface Discussion {
  discussion_uuid: string;
  discussion_description: string;
  discussion_type: string;
  discussion_date_create: string;
  discussion_members: User[]; // Liste des membres de la discussion
}

interface DiscussionsListProps {
  discussions: Discussion[];
  currentUserId: string; // L'utilisateur connecté
}

const DiscussionsList: React.FC<DiscussionsListProps> = ({ discussions = [], currentUserId }) => {
  const handleSelectDiscussion = (discussionId: string) => {
    console.log(`Discussion sélectionnée: ${discussionId}`);
  };

  return (
    <div className="discussions-list">
      {discussions && discussions.length > 0 ? (
        console.log("Discussions reçues :", discussions),
        console.log(""),
        discussions.map((discussion) => {
          // Vérification que discussion_members est défini et est bien un tableau
          const interlocutor = Array.isArray(discussion.discussion_members)
            ? discussion.discussion_members.find((member) => member._id !== currentUserId)
            : undefined;
            console.log("Interlocuteur trouvé :", discussion.discussion_members);
          return (
            <div
              key={discussion.discussion_uuid}
              className="discussion-item"
              onClick={() => handleSelectDiscussion(discussion.discussion_uuid)}
            >
              <h3>
                {interlocutor
                  ? `${interlocutor.firstname} ${interlocutor.lastname}`
                  : "Discussion sans nom"}
              </h3>
              <p>{discussion.discussion_description || "Pas de description disponible."}</p>
            </div>
          );
        })
      ) : (
        <p>Aucune discussion trouvée.</p>
      )}
    </div>
  );
};

export default DiscussionsList;