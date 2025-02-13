import Discussion from "../models/discussion.js";
import { v4 as uuidv4 } from "uuid";

class MessagesService {
  controleur;
  verbose = false;
  listeDesMessagesEmis = [
    "messages_get_response",
    "message_send_response",
    "discuss_list_response",
  ];
  listeDesMessagesRecus = [
    "messages_get_request",
    "message_send_request",
    "discuss_list_request",
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
    if (mesg.discuss_list_request) {
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
    }
  }
}

export default MessagesService;
