export interface Message {
    _id: string
    text: string
    message_sender: {
        user_firstname: string
        user_lastname: string
        user_picture: string
    }
    timestamp: string
}
