"use client";

import React from "react";

interface Discussion {
  discussion_uuid: string;
  discussion_name: string;
  discussion_description: string;
  discussion_type: string;
  discussion_date_create: string;
}

interface DiscussionsListProps {
  discussions: Discussion[];
}

const DiscussionsList: React.FC<DiscussionsListProps> = ({ discussions }) => {
  const handleSelectDiscussion = (discussionId: string) => {
    console.log(`Discussion sélectionnée: ${discussionId}`);
  };

  return (
    <div className="discussions-list">
      {discussions.length > 0 ? (
        discussions.map((discussion) => (
          <div
            key={discussion.discussion_uuid}
            className="discussion-item"
            onClick={() => handleSelectDiscussion(discussion.discussion_uuid)}
          >
            <h3>{discussion.discussion_name}</h3>
            <p>{discussion.discussion_description}</p>
          </div>
        ))
      ) : (
        <p>Aucune discussion trouvée.</p>
      )}
    </div>
  );
};

export default DiscussionsList;
