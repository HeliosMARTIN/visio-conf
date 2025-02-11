const User = require("../models/user")
const crypto = require("crypto")
const { v4: uuidv4 } = require("uuid")
class GestionUtilisateur {
    controleur
    verbose = false
    listeDesMessagesEmis = new Array(
        "connexion_reponse",
        "inscription_reponse",
        "liste_utilisateurs_reponse"
    )
    listeDesMessagesRecus = new Array(
        "connexion_requete",
        "inscription_requete",
        "liste_utilisateurs_requete"
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

        if (mesg.connexion_requete) {
            var u = await User.findOne(
                { email: mesg.connexion_requete.login },
                "user_firstname user_lastname email user_picture password"
            )
            if (u != null) {
                var mdp = await this.sha256(mesg.connexion_requete.mdp)
                if (mdp == u.password) {
                    const message = new Object()
                    message.connexion_reponse = new Object()
                    message.connexion_reponse.etat = true
                    message.connexion_reponse.user = {
                        firstname: u.user_firstname,
                        lastname: u.user_lastname,
                        email: u.email,
                    }
                    message.id = new Array()
                    message.id[0] = mesg.id
                    this.controleur.envoie(this, message)
                } else {
                    console.log(
                        "mauvais mdp, donné " + mdp + " ; en bdd " + u.password
                    )
                }
            } else {
                console.log("mauvais login")
            }
        }

        if (mesg.inscription_requete) {
            console.log("DEMANDE INSC", mesg.inscription_requete)

            try {
                const {
                    email,
                    mdp,
                    firstname,
                    lastname,
                    user_phone,
                    user_job,
                    user_desc,
                } = mesg.inscription_requete

                const existingUser = await User.findOne({ email })
                console.log("existingUser", existingUser)

                if (existingUser) {
                    throw new Error("User already exists")
                }

                const hashedPassword = await this.sha256(mdp)
                const newUser = new User({
                    user_uuid: uuidv4(),
                    email: login,
                    password: hashedPassword,
                    user_firstname: firstname,
                    user_lastname: lastname,
                    user_phone: user_phone,
                    user_job: user_job,
                    user_desc: user_desc,
                })

                await newUser.save()

                const message = {
                    inscription_reponse: {
                        etat: true,
                        user: { firstname, lastname, email },
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    inscription_reponse: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.liste_utilisateurs_requete) {
            try {
                const users = await User.find({}, "firstname lastname email")
                const message = {
                    liste_utilisateurs_reponse: {
                        etat: true,
                        users: users,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    liste_utilisateurs_reponse: {
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
