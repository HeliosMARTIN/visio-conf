import Discussion from "../models/discussion.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import SocketIdentificationService from "./SocketIdentification.js";

class MessagesService {
    controleur;
    verbose = false;
    listeDesMessagesEmis = [
        "messages_get_response",
        "message_send_response",
        "message_received",
        "discuss_list_response",
        "users_search_response",
        "discuss_remove_member_response",
        "discuss_remove_message_response",
        "message_status_response",
    ];
    listeDesMessagesRecus = [
        "messages_get_request",
        "message_send_request",
        "discuss_list_request",
        "users_search_request",
        "discuss_remove_member_request",
        "discuss_remove_message_request",
        "message_status_request",
    ];
    reconnectingSockets = new Map(); // Pour suivre les sockets en reconnexion

    constructor(c, nom) {
        this.controleur = c;
        this.nomDInstance = nom;
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "):  s'enregistre aupres du controleur"
            );
        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        );
    }

    async traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose) {
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): reçoit le message suivant à traiter"
            );
            console.log(mesg);
        }

        // Ignorer les message_received qui sont renvoyés par le client
        if (mesg.message_received) {
            if (this.controleur.verboseall || this.verbose) {
                console.log(
                    "INFO (MessagesService): Ignoring echoed message_received"
                );
            }
            return;
        }

        // CAS : DEMANDE DE LA LISTE DES MESSAGES D'UNE DISCUSSION
        if (mesg.messages_get_request) {
            try {
                const { convId } = mesg.messages_get_request;
                const discussions = await Discussion.find({
                    discussion_uuid: convId,
                }).populate({
                    path: "discussion_messages.message_sender",
                    model: "User",
                    select: "_id firstname lastname email picture socket_id uuid",
                });

                const messages = discussions.flatMap((discussion) =>
                    discussion.discussion_messages.map((msg) => ({
                        ...msg.toObject(),
                        message_sender: {
                            _id: msg.message_sender._id,
                            id: msg.message_sender._id.toString(),
                            firstname: msg.message_sender.firstname,
                            lastname: msg.message_sender.lastname,
                            email: msg.message_sender.email,
                            picture: msg.message_sender.picture,
                        },
                    }))
                );

                const message = {
                    messages_get_response: {
                        etat: true,
                        messages: messages,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            } catch (error) {
                const message = {
                    messages_get_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }

        if (mesg.message_send_request) {
            try {
                const {
                    userEmail,
                    otherUserEmail,
                    discussion_uuid,
                    message_uuid,
                    message_content,
                    message_date_create,
                    discussion_creator,
                } = mesg.message_send_request;

                console.log("Processing message send request:", {
                    userEmail,
                    otherUserEmail,
                    discussion_uuid,
                    message_uuid,
                    discussion_creator,
                });

                // Récupérer l'expéditeur
                const sender = await User.findOne({ email: userEmail });
                if (!sender) {
                    throw new Error("Expéditeur non trouvé");
                }

                let discussion;

                // Cas d'une nouvelle discussion
                if (otherUserEmail) {
                    // Convertir otherUserEmail en tableau s'il ne l'est pas déjà
                    const otherEmails = Array.isArray(otherUserEmail)
                        ? otherUserEmail
                        : [otherUserEmail];

                    // Récupérer tous les utilisateurs
                    const users = await User.find({
                        email: { $in: [userEmail, ...otherEmails] },
                    });
                    if (!users || users.length === 0) {
                        throw new Error(
                            "Aucun utilisateur trouvé avec les emails fournis"
                        );
                    }

                    // Créer la nouvelle discussion
                    discussion = new Discussion({
                        discussion_uuid: discussion_uuid,
                        discussion_creator: sender._id,
                        discussion_members: users.map((user) => user._id),
                        discussion_type:
                            otherEmails.length === 1 ? "direct" : "group",
                        discussion_messages: [
                            {
                                message_uuid: message_uuid,
                                message_sender: sender._id,
                                message_content: message_content,
                                message_date_create:
                                    message_date_create || new Date(),
                                message_status: "sent",
                            },
                        ],
                    });

                    await discussion.save();
                    console.log(
                        "New discussion created:",
                        discussion.discussion_uuid
                    );
                } else {
                    // Cas d'un message dans une discussion existante
                    discussion = await Discussion.findOne({ discussion_uuid });
                    if (!discussion) {
                        throw new Error("Discussion non trouvée");
                    }

                    // Vérifier si l'utilisateur est membre
                    const isMember = discussion.discussion_members.some(
                        (member) => member.toString() === sender._id.toString()
                    );
                    if (!isMember) {
                        throw new Error(
                            "Utilisateur non autorisé à envoyer des messages dans cette discussion"
                        );
                    }

                    // Ajouter le nouveau message
                    discussion.discussion_messages.push({
                        message_uuid: message_uuid,
                        message_sender: sender._id,
                        message_content: message_content,
                        message_date_create: message_date_create || new Date(),
                        message_status: "sent",
                    });

                    await discussion.save();
                }

                // Récupérer les socket IDs des membres
                console.log(
                    "Discussion members:",
                    discussion.discussion_members
                );
                const socketIdPromises = discussion.discussion_members.map(
                    async (userId) => {
                        const socketId =
                            await SocketIdentificationService.getUserSocketId(
                                userId.toString()
                            );
                        console.log(`Socket ID for user ${userId}:`, socketId);
                        return socketId;
                    }
                );
                const socketIds = (await Promise.all(socketIdPromises)).filter(
                    (id) => id !== null && id !== "none"
                );
                console.log("Valid socket IDs:", socketIds);

                // Préparer le message pour la réponse
                const populatedDiscussion = await discussion.populate({
                    path: "discussion_messages.message_sender",
                    model: "User",
                    select: "firstname lastname email picture",
                });

                const lastMessage =
                    populatedDiscussion.discussion_messages[
                        populatedDiscussion.discussion_messages.length - 1
                    ];

                // Envoyer la confirmation à l'expéditeur avec le message complet
                const message = {
                    message_send_response: {
                        etat: true,
                        message: {
                            ...lastMessage.toObject(),
                            message_sender: {
                                _id: lastMessage.message_sender._id,
                                firstname: lastMessage.message_sender.firstname,
                                lastname: lastMessage.message_sender.lastname,
                                email: lastMessage.message_sender.email,
                                picture: lastMessage.message_sender.picture,
                            },
                        },
                    },
                    id: [mesg.id],
                };
                console.log("Sending message to sender:", message);
                this.controleur.envoie(this, message);

                // Filtrer les socket IDs pour exclure l'expéditeur
                const otherMemberSocketIds = socketIds.filter(
                    (id) => id !== mesg.id
                );
                console.log("Other member socket IDs:", otherMemberSocketIds);

                // Envoyer le message aux autres membres seulement s'il y a des socket IDs valides
                if (otherMemberSocketIds.length > 0) {
                    const messageReceived = {
                        message_received: {
                            message: {
                                ...lastMessage.toObject(),
                                message_sender: {
                                    _id: lastMessage.message_sender._id,
                                    firstname:
                                        lastMessage.message_sender.firstname,
                                    lastname:
                                        lastMessage.message_sender.lastname,
                                    email: lastMessage.message_sender.email,
                                    picture: lastMessage.message_sender.picture,
                                },
                            },
                        },
                        id: otherMemberSocketIds,
                    };
                    console.log(
                        "Sending message to other members:",
                        messageReceived
                    );
                    this.controleur.envoie(this, messageReceived);
                } else {
                    console.log("No valid socket IDs found for other members");
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi du message:", error);
                const message = {
                    message_send_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }
        if (mesg.discuss_list_request) {
            try {
                const userId = mesg.discuss_list_request;

                // D'abord, trouver l'utilisateur pour obtenir son ObjectId
                let user = null;

                // Essayer d'abord avec ObjectId (si c'est un ObjectId MongoDB)
                if (
                    userId &&
                    userId.length === 24 &&
                    /^[0-9a-fA-F]{24}$/.test(userId)
                ) {
                    user = await User.findById(userId);
                }

                // Si pas trouvé, essayer avec UUID
                if (!user) {
                    user = await User.findOne({ uuid: userId });
                }

                if (!user) {
                    throw new Error(
                        `Utilisateur non trouvé avec l'ID: ${userId}`
                    );
                }

                // Maintenant utiliser l'ObjectId pour chercher les discussions
                const discussions = await Discussion.find({
                    discussion_members: user._id,
                }).populate({
                    path: "discussion_members",
                    model: "User",
                    select: "_id uuid firstname lastname picture is_online",
                });

                const formattedDiscussions = discussions.map((discussion) => {
                    // Récupérer le dernier message de la discussion
                    const lastMessage =
                        discussion.discussion_messages.length > 0
                            ? discussion.discussion_messages[
                                  discussion.discussion_messages.length - 1
                              ]
                            : null;

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
                                id: member.uuid,
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
                    };
                });

                const message = {
                    discuss_list_response: {
                        etat: true,
                        discussList: formattedDiscussions,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            } catch (error) {
                console.error("Erreur dans discuss_list_request:", error);
                const message = {
                    discuss_list_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }

        if (mesg.users_search_request) {
            try {
                const searchQuery = mesg.users_search_request;
                console.log("Recherche avec la requête:", searchQuery);

                const query = {
                    $or: [
                        { firstname: new RegExp(searchQuery, "i") },
                        { lastname: new RegExp(searchQuery, "i") },
                    ],
                };

                console.log("Query MongoDB:", query);

                // Assurez-vous que vous importez le bon modèle
                const users = await User.find(query).select(
                    "_id firstname lastname email picture"
                );
                console.log("Utilisateurs trouvés:", users);

                const formattedUsers = users.map((user) => ({
                    id: user._id.toString(), // Convertir l'ObjectId en string
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    picture: user.picture || "",
                }));

                console.log("Utilisateurs formatés:", formattedUsers);

                const message = {
                    users_search_response: {
                        etat: true,
                        users: formattedUsers,
                    },
                    id: [mesg.id],
                };

                this.controleur.envoie(this, message);
            } catch (error) {
                console.error("Erreur lors de la recherche:", error);
                const message = {
                    users_search_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }
        // CAS : DEMANDE DE SUPPRESSION MEMBRE D'UNE DISCUSSION
        if (mesg.discuss_remove_member_request) {
            try {
                const [userId, discussId] = mesg.discuss_remove_member_request;

                // Trouver d'abord la discussion
                const discussion = await Discussion.findOne({
                    discussion_uuid: discussId,
                });

                if (!discussion) {
                    throw new Error("Discussion non trouvée");
                }

                // Si c'est une discussion 1-1, supprimer complètement la discussion
                if (discussion.discussion_type === "direct") {
                    await Discussion.deleteOne({ discussion_uuid: discussId });
                } else {
                    // Pour les groupes, retirer uniquement le membre
                    await Discussion.findOneAndUpdate(
                        { discussion_uuid: discussId },
                        { $pull: { discussion_members: userId } },
                        { new: true }
                    );

                    // Si c'était le dernier membre, supprimer la discussion
                    const updatedDiscussion = await Discussion.findOne({
                        discussion_uuid: discussId,
                    });
                    if (
                        updatedDiscussion &&
                        updatedDiscussion.discussion_members.length === 0
                    ) {
                        await Discussion.deleteOne({
                            discussion_uuid: discussId,
                        });
                    }
                }

                const message = {
                    discuss_remove_member_response: {
                        etat: true,
                        discussionDeleted:
                            discussion.discussion_type === "direct",
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            } catch (error) {
                const message = {
                    discuss_remove_member_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }
        // CAS : DEMANDE DE SUPPRESSION DE MESSAGE
        if (mesg.discuss_remove_message_request) {
            try {
                const [messageId, convId] = mesg.discuss_remove_message_request;

                const discussion = await Discussion.findOneAndUpdate(
                    { discussion_uuid: convId },
                    {
                        $pull: {
                            discussion_messages: { message_uuid: messageId },
                        },
                    },
                    { new: true }
                );

                const message = {
                    discuss_remove_message_response: {
                        etat: true,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            } catch (error) {
                const message = {
                    discuss_remove_message_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }
        // CAS : PASSAGE A LU DES MESSAGES
        if (mesg.message_status_request) {
            try {
                const convID = mesg.message_status_request;

                // Marquer tous les messages comme "read"
                const conv = await Discussion.findOneAndUpdate(
                    { discussion_uuid: convID },
                    {
                        $set: {
                            "discussion_messages.$[elem].message_status":
                                "read",
                        },
                    },
                    {
                        arrayFilters: [
                            { "elem.message_status": { $ne: "read" } },
                        ],
                        new: true,
                    }
                ).populate({
                    path: "discussion_members",
                    model: "User",
                    select: "socket_id",
                });
                if (conv == null) throw new Error("Discussion non trouvée");

                // Extraire tous les socket_id des membres
                const socketIds = conv.discussion_members
                    .map((member) => member.socket_id)
                    .filter((id) => id && id !== "none"); // Tu peux filtrer ceux qui n'ont pas de socket_id actif

                const message = {
                    message_status_response: {
                        etat: true,
                    },
                    id: socketIds,
                };

                this.controleur.envoie(this, message);
            } catch (error) {
                const message = {
                    message_status_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                };
                this.controleur.envoie(this, message);
            }
        }

        // Gérer la déconnexion
        if (mesg.client_deconnexion) {
            try {
                const socketId = mesg.client_deconnexion;

                // Attendre un délai plus long avant de nettoyer le socket
                setTimeout(async () => {
                    const success =
                        await SocketIdentificationService.removeUserSocket(
                            socketId
                        );
                    if (!success) {
                        console.log(
                            `Échec de la suppression du socket ${socketId}`
                        );
                    }
                }, 5000); // Attendre 5 secondes

                const message = {
                    client_deconnexion_response: {
                        etat: true,
                    },
                    id: [socketId],
                };
                this.controleur.envoie(this, message);
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
            }
        }

        // Gérer la reconnexion
        if (mesg.client_connexion) {
            try {
                const { socketId, userId } = mesg.client_connexion;

                // Mettre à jour l'identification du socket
                const success =
                    await SocketIdentificationService.updateUserSocket(
                        userId,
                        socketId
                    );

                if (success) {
                    const message = {
                        client_connexion_response: {
                            etat: true,
                        },
                        id: [socketId],
                    };
                    this.controleur.envoie(this, message);
                } else {
                    console.error(
                        `Échec de la mise à jour du socket pour l'utilisateur ${userId}`
                    );
                }
            } catch (error) {
                console.error("Erreur lors de la reconnexion:", error);
            }
        }
    }
}

export default MessagesService;
