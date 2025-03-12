export interface User {
    _id: string;
    userId: string;
    firstname: string;
    lastname: string;
    picture?: string;
    is_online?: boolean;
  }
  
  export interface Discussion {
    discussion_uuid: string;
    discussion_name: string;
    discussion_description: string;
    discussion_type: string;
    discussion_date_create: string;
    discussion_members: User[];
    discussion_creator: string;
    last_message?: {
      message_uuid: string;
      message_content: string;
      message_date_create: string;
      message_sender: User;
    };
  }
  
  export interface Message {
    message_uuid: string;
    message_content: string;
    message_sender: User;
    message_date_create: string;
    message_status: 'sent' | 'received' | 'read';
  }