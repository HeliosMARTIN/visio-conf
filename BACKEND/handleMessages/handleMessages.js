const Message = require("../models/message")
const { v4: uuidv4 } = require("uuid")

class HandleMessages {
    controleur
    verbose = false
    listeDesMessagesEmis = ["messages_reponse"]
    listeDesMessagesRecus = ["messages_requete"]

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

        if (mesg.messages_requete) {
            try {
                const { userEmail, otherUserEmail } = mesg.messages_requete
                const messages = await Message.find({
                    $or: [
                        { sender: userEmail, receiver: otherUserEmail },
                        { sender: otherUserEmail, receiver: userEmail },
                    ],
                })

                const message = {
                    messages_reponse: {
                        etat: true,
                        messages: messages,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    messages_reponse: {
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
