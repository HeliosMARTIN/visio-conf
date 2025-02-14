import Discussion from "../models/discussion.js";
import User from "../models/discussion.js";
import { v4 as uuidv4 } from "uuid";

class MessagesService {
  controleur;
  verbose = false;
  listeDesMessagesEmis = [
    "messages_get_response",
    "message_send_response",
    "discuss_list_response",
    "users_shearch_response",
    "discuss_remove_member_response",
    "discuss_remove_message_response",
  ];
  listeDesMessagesRecus = [
    "messages_get_request",
    "message_send_request",
    "discuss_list_request",
    "users_shearch_request",
    "discuss_remove_member_request",
    "discuss_remove_message_request",
  ];

  constructor(c, nom) {
    this.controleur = c;
    this.nomDInstance = nom;
    if (this.controleur.verboseall || this.verbose)
      console.log(
        "INFO (" + this.nomDInstance + "):  s'enregistre aupres du controleur"
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
        "INFO (" + this.nomDInstance + "): reçoit le message suivant à traiter"
      );
      console.log(mesg);
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
          select: "firstname lastname picture socket_id uuid",
        });

        const messages = discussions.flatMap(
          (discussion) => discussion.discussion_messages
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
    // CAS : DEMANDE D'ENVOI DE MESSAGE & CREATION DE DISCUSSION
    if (mesg.message_send_request) {
      try {
        if (mesg.message_send_request.otherUserEmail != "undefined") {
          const { userEmail, otherUserEmail, text } = mesg.message_send_request;
          const discussionMembers = [userEmail, ...otherUserEmail];
          if (otherUserEmail.Lenght === 1) {
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
            );
          } else {
            await Discussion.create({
              discussion_members: discussionMembers,
              discussion_messages: [
                {
                  _id: uuidv4(),
                  message_sender: userEmail,
                  text: text,
                  timestamp: new Date(),
                },
              ],
            });
          }
        } else if (mesg.message_send_request.convId != "undefined") {
          const { userEmail, convId, text } = mesg.message_send_request;
          await Discussion.findOneAndUpdate(
            {
              convId: convId,
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
          );
        }
        const message = {
          message_send_response: {
            etat: true,
          },
          id: [mesg.id],
        };
        this.controleur.envoie(this, message);
      } catch (error) {
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
    // CAS : DEMANDE DE LA LISTE DES DISCUSSION DE L'UTILISATEUR
    if (mesg.discuss_list_request) {
      try {
        const userId = mesg.discuss_list_request;
        const discussions = await Discussion.find({
          discussion_members: userId,
        })
          .select(
            "discussion_uuid discussion_name discussion_description discussion_type discussion_date_create"
          )
          .populate({
            path: "discussion_messages.message_sender",
            select: "firstname lastname picture socket_id uuid",
          });

        const message = {
          discuss_list_response: {
            etat: true,
            messages: discussions,
          },
          id: [mesg.id],
        };

        this.controleur.envoie(this, message);
      } catch (error) {
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
    // CAS : RECHERCHE DE CONTACT
    if (mesg.users_shearch_request) {
      try {
        const args = users_shearch_request;
        const query = {
          $or: [
            { firstname: new RegExp(args, "i") },
            { lastname: new RegExp(args, "i") },
            { email: new RegExp(args, "i") },
          ],
        };
        const users = await User.find(query, "firstname lastname email");

        const formattedUsers = users.map((user) => ({
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          picture: user.picture,
        }));
        const message = {
          users_shearch_response: {
            etat: true,
            users: formattedUsers,
          },
          id: [mesg.id],
        };
        console.log("on renvoie la response");

        this.controleur.envoie(this, message);
      } catch (error) {
        const message = {
          users_shearch_response: {
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
        const discussion = await Discussion.findOneAndUpdate(
          { discussion_uuid: discussId },
          { $pull: { discussion_members: userId } },
          { new: true }
        );
        if (discussion.discussion_members.length === 0) {
          await Discussion.deleteOne({ discussion_uuid: discussId });
        }
        const message = {
          discuss_remove_member_response: {
            etat: true,
          },
          id: [mesg.id],
        };
        this.controleur.envoie(this, message);
      } catch (error) {
        const message = {
          users_shearch_response: {
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
          { $pull: { discussion_messages: { message_uuid: messageId } } },
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
          users_shearch_response: {
            etat: false,
            error: error.message,
          },
          id: [mesg.id],
        };
        this.controleur.envoie(this, message);
      }
    }
  }
}

export default MessagesService;
