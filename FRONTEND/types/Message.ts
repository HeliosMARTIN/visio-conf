export interface Message {
    _id: string
    text: string
    message_sender: {
        firstname: string
        lastname: string
        picture: string
    }
    timestamp: string
}
