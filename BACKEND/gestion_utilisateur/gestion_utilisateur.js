const User = require("../models/user")
const crypto = require("crypto")
const { v4: uuidv4 } = require("uuid")
class GestionUtilisateur {
    controleur
    verbose = false
    listeDesMessagesEmis = new Array(
        "login_response",
        "signup_response",
        "users_list_response"
    )
    listeDesMessagesRecus = new Array(
        "login_request",
        "signup_request",
        "users_list_request"
    )
    listeJoueurs = new Object()

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

        if (mesg.login_request) {
            var u = await User.findOne(
                { user_email: mesg.login_request.login },
                "user_firstname user_lastname user_email user_picture user_password"
            )
            if (u != null) {
                var mdp = await this.sha256(mesg.login_request.mdp)
                if (mdp == u.user_password) {
                    const message = new Object()
                    message.login_response = new Object()
                    message.login_response.etat = true
                    message.login_response.user = {
                        firstname: u.user_firstname,
                        lastname: u.user_lastname,
                        email: u.user_email,
                    }
                    message.id = new Array()
                    message.id[0] = mesg.id
                    this.controleur.envoie(this, message)
                } else {
                    console.log(
                        "mauvais mdp, donné " +
                            mdp +
                            " ; en bdd " +
                            u.user_password
                    )
                }
            } else {
                console.log("mauvais login")
            }
        }

        if (mesg.signup_request) {
            console.log("DEMANDE INSC", mesg.signup_request)

            try {
                const {
                    login,
                    mdp,
                    firstname,
                    lastname,
                    user_phone,
                    user_job,
                    user_desc,
                } = mesg.signup_request

                const existingUser = await User.findOne({ user_email:login })
                console.log("existingUser", existingUser)

                if (existingUser) {
                    throw new Error("User already exists")
                }

                const hashedPassword = await this.sha256(mdp)
                const newUser = new User({
                    user_uuid: uuidv4(),
                    user_email: login,
                    user_password: hashedPassword,
                    user_firstname: firstname,
                    user_lastname: lastname,
                    user_phone: user_phone,
                    user_job: user_job,
                    user_desc: user_desc,
                })

                await newUser.save()

                const message = {
                    signup_response: {
                        etat: true,
                        user: { firstname, lastname, email:login },
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    signup_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.users_list_request) {
            try {
                const users = await User.find({}, "firstname lastname email")
                const message = {
                    users_list_response: {
                        etat: true,
                        users: users,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    users_list_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }
    }

    sha256 = async (text) => {
        // Encode le texte en un Uint8Array
        const encoder = new TextEncoder()
        const data = encoder.encode(text)

        // Utilise l'API SubtleCrypto pour générer le hash
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)

        // Convertit le buffer en une chaîne hexadécimale
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    }
}
module.exports = GestionUtilisateur
