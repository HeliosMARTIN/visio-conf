import { ListeMessagesEmis, ListeMessagesRecus } from "./ListeMessages.js";
import SocketIdentificationService from "./services/SocketIdentification.js";
import User from "./models/user.js";

class CanalSocketio {
    controleur;
    nomDInstance;
    socket;
    listeDesMessagesEmis = ListeMessagesEmis;
    listeDesMessagesRecus = ListeMessagesRecus;
    verbose = false;

    constructor(s, c, nom) {
        this.controleur = c;
        this.socket = s;
        this.nomDInstance = nom;
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): " +
                    this.nomDInstance +
                    " s'enrgistre aupres du controleur"
            );
        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        );

        this.socket.on("connection", (socket) => {
            socket.on("message", (msg) => {
                let message = JSON.parse(msg);
                message.id = socket.id;
                if (this.controleur.verboseall || this.verbose)
                    console.log(
                        "INFO (" +
                            this.nomDInstance +
                            "): conalsocketio reçoit: " +
                            msg +
                            " de la paet de " +
                            socket.id
                    );
                this.controleur.envoie(this, message);
            });

            socket.on("demande_liste", (msg) => {
                var T = new Object();
                T.abonnement = this.listeDesMessagesEmis;
                T.emission = this.listeDesMessagesRecus;
                if (this.controleur.verboseall || this.verbose)
                    console.log(
                        "INFO (" +
                            this.nomDInstance +
                            "): on donne les listes émission et abonnement"
                    );
                socket.emit("donne_liste", JSON.stringify(T));
            });

            socket.on("disconnect", async () => {
                try {
                    const socketId = socket.id;
                    const userInfo =
                        await SocketIdentificationService.getUserInfoBySocketId(
                            socketId
                        );

                    if (userInfo) {
                        // Mettre à jour le statut de l'utilisateur
                        const user = await User.findOneAndUpdate(
                            { _id: userInfo._id },
                            {
                                $set: {
                                    is_online: false,
                                    disturb_status: "offline",
                                    socket_id: "none",
                                },
                            },
                            { new: true }
                        );

                        if (user) {
                            console.log(
                                `👋 Utilisateur ${user.firstname} ${user.lastname} déconnecté (socket: ${socketId})`
                            );
                            // Nettoyer les Maps
                            SocketIdentificationService.userToSocket.delete(
                                userInfo._id
                            );
                            SocketIdentificationService.socketToUser.delete(
                                socketId
                            );
                        } else {
                            console.warn(
                                `Utilisateur avec l'ID ${userInfo._id} non trouvé en base.`
                            );
                        }
                    } else {
                        console.warn(
                            `Aucun utilisateur trouvé pour le socket ${socketId}`
                        );
                    }
                } catch (err) {
                    console.error("Erreur lors de la déconnexion:", err);
                } finally {
                    // Notifier le contrôleur de la déconnexion
                    const message = { client_deconnexion: socket.id };
                    this.controleur.envoie(this, message);
                }
            });
        });
    }

    traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): canalsocketio va emettre sur la/les socket " +
                    JSON.stringify(mesg)
            );
        if (typeof mesg.id == "undefined")
            this.socket.emit("message", JSON.stringify(mesg));
        else {
            let message = JSON.parse(JSON.stringify(mesg));
            delete message.id;
            message = JSON.stringify(message);
            for (var i = 0; i < mesg.id.length; i++) {
                if (this.controleur.verboseall || this.verbose)
                    console.log(
                        "INFO (" +
                            this.nomDInstance +
                            "):emission sur la socket: " +
                            mesg.id[i]
                    );
                this.socket.to(mesg.id[i]).emit("message", message);
            }
        }
    }
}
export default CanalSocketio;
