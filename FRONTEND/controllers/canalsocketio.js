import io from "socket.io-client";
import Controleur from "@/controllers/controleur";

class CanalSocketio {
    controleur;
    nomDInstance;
    socket;
    isAuthenticating = false;
    pendingAuthToken = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;

    listeDesMessagesEmis;
    listeDesMessagesRecus;
    verbose = false;

    constructor(c, nom) {
        this.controleur = c;
        this.nomDInstance = nom;

        this.socket = io("http://localhost:3220", {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 10000,
        });

        this.socket.on("connect", () => {
            console.log(`Socket connecté (${this.socket.id})`);
            this.reconnectAttempts = 0;
            if (this.pendingAuthToken) {
                this.authenticate(this.pendingAuthToken);
            }
        });

        this.socket.on("disconnect", (reason) => {
            console.log(`Socket déconnecté (${reason})`);
            if (
                reason === "io server disconnect" ||
                reason === "transport close"
            ) {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(
                        `Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
                    );
                    setTimeout(() => {
                        this.socket.connect();
                    }, 1000);
                } else {
                    console.error(
                        "Nombre maximum de tentatives de reconnexion atteint"
                    );
                }
            }
        });

        this.socket.on("connect_error", (error) => {
            console.error("Erreur de connexion socket:", error);
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(
                    `Tentative de reconnexion après erreur ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
                );
            }
        });

        this.socket.on("reconnect", (attemptNumber) => {
            console.log(`Socket reconnecté après ${attemptNumber} tentatives`);
            this.reconnectAttempts = 0;
            if (this.pendingAuthToken) {
                this.authenticate(this.pendingAuthToken);
            }
        });

        this.socket.on("reconnect_error", (error) => {
            console.error("Erreur de reconnexion:", error);
        });

        this.socket.on("reconnect_failed", () => {
            console.error(
                "Échec de la reconnexion après toutes les tentatives"
            );
        });

        this.socket.on("message", (msg) => {
            if (this.controleur.verboseall || this.verbose)
                console.log(
                    "INFO (" + this.nomDInstance + "): reçoit ce message:" + msg
                );
            this.controleur.envoie(this, JSON.parse(msg));
        });

        this.socket.on("donne_liste", (msg) => {
            var listes = JSON.parse(msg);
            this.listeDesMessagesEmis = listes.emission;
            this.listeDesMessagesRecus = listes.abonnement;
            if (this.controleur.verboseall || this.verbose)
                console.log(
                    "INFO (" +
                        this.nomDInstance +
                        "): inscription des messages de CanalSocketio"
                );

            this.controleur.inscription(
                this,
                listes.emission,
                listes.abonnement
            );
        });

        this.socket.emit("demande_liste", {});
    }

    authenticate(token) {
        if (this.isAuthenticating) {
            console.log("Authentification déjà en cours, mise en attente...");
            this.pendingAuthToken = token;
            return Promise.reject(
                new Error("Authentication already in progress")
            );
        }

        this.isAuthenticating = true;
        this.pendingAuthToken = token;

        return new Promise((resolve, reject) => {
            if (!this.socket.connected) {
                console.log("Socket non connecté, tentative de connexion...");
                this.socket.connect();
            }

            const timeout = setTimeout(() => {
                this.isAuthenticating = false;
                this.pendingAuthToken = null;
                reject(new Error("Authentication timeout"));
            }, 5000);

            this.socket.emit("authenticate", token, (response) => {
                clearTimeout(timeout);
                this.isAuthenticating = false;
                this.pendingAuthToken = null;

                if (response && response.etat) {
                    console.log("Authentification réussie");
                    resolve(response);
                } else {
                    console.error(
                        "Échec de l'authentification:",
                        response?.error
                    );
                    reject(
                        new Error(response?.error || "Authentication failed")
                    );
                }
            });
        });
    }

    traitementMessage(mesg) {
        if (!this.socket.connected) {
            console.warn("Socket non connecté, tentative de reconnexion...");
            this.socket.connect();
        }
        this.socket.emit("message", JSON.stringify(mesg));
    }
}

export default CanalSocketio;
