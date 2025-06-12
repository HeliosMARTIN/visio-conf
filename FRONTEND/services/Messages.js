if (mesg.message_send_request) {
    try {
        const {
            userEmail,
            otherUserEmail,
            discussion_creator,
            discussion_uuid,
            message_content,
            message_uuid,
            message_date_create,
        } = mesg.message_send_request

        // Cas d'une nouvelle discussion
        if (otherUserEmail) {
            // Si otherUserEmail est un tableau avec un seul élément, c'est une discussion 1-1
            const isOneToOne = Array.isArray(otherUserEmail) && otherUserEmail.length === 1;
            
            const discussionEmails = [userEmail, ...(Array.isArray(otherUserEmail) ? otherUserEmail : [otherUserEmail])];
            
            // ... existing user search code ...

            const newDiscussion = {
                discussion_uuid: discussion_uuid,
                discussion_creator: sender._id,
                discussion_members: members,
                discussion_type: isOneToOne ? "direct" : "group", // Ajout du type de discussion
                discussion_messages: [
                    {
                        message_uuid: message_uuid,
                        message_sender: sender._id,
                        message_content: message_content,
                        message_date_create: message_date_create || new Date(),
                    },
                ],
            }
            // ... existing code ...
        }
        // ... existing code ...
    }
} 