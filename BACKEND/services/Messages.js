import Discussion from "../models/discussion.js"
import User from "../models/user.js"
import { v4 as uuidv4 } from "uuid"

class MessagesService {
    controleur
    verbose = false
    listeDesMessagesEmis = [
        "messages_get_response",
        "message_send_response",
        "discuss_list_response",
        "users_search_response",
        "discuss_remove_member_response",
        "discuss_remove_message_response",
    ]
    listeDesMessagesRecus = [
        "messages_get_request",
        "message_send_request",
        "discuss_list_request",
        "users_search_request",
        "discuss_remove_member_request",
        "discuss_remove_message_request",
    ]

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
        // CAS : DEMANDE DE LA LISTE DES MESSAGES D'UNE DISCUSSION
        if (mesg.messages_get_request) {
            try {
                const { convId } = mesg.messages_get_request
                const discussions = await Discussion.find({
                    discussion_uuid: convId,
                }).populate({
                    path: "discussion_messages.message_sender",
                    model: "User",
                    select: "firstname lastname picture socket_id uuid",
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
                    const discussionMembers = [userEmail, ...otherUserEmail]

                    const newDiscussion = {
                        discussion_uuid: discussion_uuid,
                        discussion_creator: discussion_creator,
                        discussion_members: discussionMembers,
                        discussion_messages: [
                            {
                                message_uuid: message_uuid,
                                message_sender: userEmail,
                                message_content: message_content,
                                message_date_create:
                                    message_date_create || new Date(),
                            },
                        ],
                    }

                    await Discussion.create(newDiscussion)
                }
                // Cas d'un message dans une discussion existante
                else {
                    const discussion = await Discussion.findOne({
                        discussion_uuid,
                    }).populate({
                        path: "discussion_members",
                        model: "User",
                        select: "_id email",
                    })

                    if (!discussion) {
                        throw new Error("Discussion non trouvée")
                    }

                    // Récupérer l'utilisateur à partir de son email
                    const user = await User.findOne({ email: userEmail })
                    if (!user) {
                        throw new Error("Utilisateur non trouvé")
                    }

                    // Vérifier que l'utilisateur fait partie de la discussion en utilisant son _id
                    const isMember = discussion.discussion_members.some(
                        (member) =>
                            member._id.toString() === user._id.toString()
                    )

                    if (!isMember) {
                        console.log(
                            "Membres de la discussion:",
                            discussion.discussion_members.map((m) => m._id)
                        )
                        console.log("ID de l'utilisateur:", user._id)
                        throw new Error(
                            "Utilisateur non autorisé à envoyer des messages dans cette discussion"
                        )
                    }

                    // Ajouter le nouveau message à la discussion en utilisant l'ID de l'utilisateur
                    discussion.discussion_messages.push({
                        message_uuid,
                        message_sender: user._id, // Utiliser l'ID au lieu de l'email
                        message_content,
                        message_date_create: message_date_create || new Date(),
                    })

                    await discussion.save()
                }

                const message = {
                    message_send_response: {
                        etat: true,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                console.error("Erreur lors de l'envoi du message:", error)
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
        if (mesg.discuss_list_request) {
            try {
                const userId = mesg.discuss_list_request
                const discussions = await Discussion.find({
                    discussion_members: userId,
                }).populate({
                    path: "discussion_members",
                    model: "User",
                    select: "_id firstname lastname picture is_online",
                })

                const formattedDiscussions = discussions.map((discussion) => {
                    // Récupérer le dernier message de la discussion
                    const lastMessage =
                        discussion.discussion_messages.length > 0
                            ? discussion.discussion_messages[
                                  discussion.discussion_messages.length - 1
                              ]
                            : null

                    return {
                        discussion_uuid: discussion.discussion_uuid,
                        discussion_name: discussion.discussion_name,
                        discussion_description:
                            discussion.discussion_description,
                        discussion_type: discussion.discussion_type,
                        discussion_date_create:
                            discussion.discussion_date_create,
                        discussion_members: discussion.discussion_members.map(
                            (member) => ({
                                _id: member._id.toString(),
                                firstname: member.firstname,
                                lastname: member.lastname,
                                picture: member.picture,
                                is_online: member.is_online,
                            })
                        ),
                        // Ajouter le dernier message
                        last_message: lastMessage
                            ? {
                                  message_content: lastMessage.message_content,
                                  message_date_create:
                                      lastMessage.message_date_create,
                                  message_sender: lastMessage.message_sender,
                              }
                            : null,
                    }
                })

                const message = {
                    discuss_list_response: {
                        etat: true,
                        messages: formattedDiscussions,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    discuss_list_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.users_search_request) {
            try {
                const searchQuery = mesg.users_search_request
                console.log("Recherche avec la requête:", searchQuery)

                const query = {
                    $or: [
                        { firstname: new RegExp(searchQuery, "i") },
                        { lastname: new RegExp(searchQuery, "i") },
                    ],
                }

                console.log("Query MongoDB:", query)

                // Assurez-vous que vous importez le bon modèle
                const users = await User.find(query).select(
                    "_id firstname lastname email picture"
                )
                console.log("Utilisateurs trouvés:", users)

                const formattedUsers = users.map((user) => ({
                    id: user._id.toString(), // Convertir l'ObjectId en string
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    picture: user.picture || "",
                }))

                console.log("Utilisateurs formatés:", formattedUsers)

                const message = {
                    users_search_response: {
                        etat: true,
                        users: formattedUsers,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                console.error("Erreur lors de la recherche:", error)
                const message = {
                    users_search_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }
        // CAS : DEMANDE DE SUPPRESSION MEMBRE D'UNE DISCUSSION
        if (mesg.discuss_remove_member_request) {
            try {
                const [userId, discussId] = mesg.discuss_remove_member_request
                const discussion = await Discussion.findOneAndUpdate(
                    { discussion_uuid: discussId },
                    { $pull: { discussion_members: userId } },
                    { new: true }
                )
                if (discussion.discussion_members.length === 0) {
                    await Discussion.deleteOne({ discussion_uuid: discussId })
                }
                const message = {
                    discuss_remove_member_response: {
                        etat: true,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    users_search_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }
        // CAS : DEMANDE DE SUPPRESSION DE MESSAGE
        if (mesg.discuss_remove_message_request) {
            try {
                const [messageId, convId] = mesg.discuss_remove_message_request

                const discussion = await Discussion.findOneAndUpdate(
                    { discussion_uuid: convId },
                    {
                        $pull: {
                            discussion_messages: { message_uuid: messageId },
                        },
                    },
                    { new: true }
                )

                const message = {
                    discuss_remove_message_response: {
                        etat: true,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    users_search_response: {
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

export default MessagesService
