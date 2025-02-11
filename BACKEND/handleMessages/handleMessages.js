const Discussion = require("../models/discussion")
const { v4: uuidv4 } = require("uuid")

class HandleMessages {
    controleur
    verbose = false
    listeDesMessagesEmis = ["messages_get_response", "message_send_response"]
    listeDesMessagesRecus = ["messages_get_request", "message_send_request"]

    constructor(c, nom) {
        this.controleur = c
        this.nomDInstance = nom
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "):  s'enregistre aupres du controleur"
            )
        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        )
    }

    async traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose) {
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): reçoit le message suivant à traiter"
            )
            console.log(mesg)
        }

        if (mesg.messages_get_request) {
            try {
                const { userEmail, otherUserEmail } = mesg.messages_get_request
                const discussions = await Discussion.find({
                    discussion_members: { $all: [userEmail, otherUserEmail] },
                }).populate({
                    path: "discussion_messages.message_sender",
                    model: "User",
                    select: "user_firstname user_lastname user_picture user_socket_id user_uuid",
                })

                const messages = discussions.flatMap(
                    (discussion) => discussion.discussion_messages
                )

                const message = {
                    messages_get_response: {
                        etat: true,
                        messages: messages,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    messages_get_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.message_send_request) {
            try {
                const { userEmail, otherUserEmail, text } =
                    mesg.message_send_request
                await Discussion.findOneAndUpdate(
                    {
                        discussion_members: {
                            $all: [userEmail, otherUserEmail],
                        },
                    },
                    {
                        $push: {
                            discussion_messages: {
                                _id: uuidv4(),
                                message_sender: userEmail,
                                text: text,
                                timestamp: new Date(),
                            },
                        },
                    },
                    { new: true, upsert: true }
                )

                const message = {
                    message_send_response: {
                        etat: true,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    message_send_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }
    }
}

module.exports = HandleMessages
