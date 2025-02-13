import User from "../models/user.js"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

class UsersService {
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
            try {
                const { email, password } = mesg.login_request
                console.log(email, password)

                const hashedPassword = await this.sha256(password)
                const user = await User.findOne({
                    email,
                    password: hashedPassword,
                })
                if (user) {
                    const token = jwt.sign(
                        {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email,
                            picture: user.picture,
                            userId: user._id,
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "1d" }
                    )
                    const message = {
                        login_response: { etat: true, token },
                        id: [mesg.id],
                    }
                    this.controleur.envoie(this, message)
                } else {
                    throw new Error("Invalid credentials")
                }
            } catch (error) {
                const message = {
                    login_response: { etat: false, error: error.message },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.signup_request) {
            try {
                const {
                    email,
                    password,
                    firstname,
                    lastname,
                    phone,
                    job,
                    desc,
                } = mesg.signup_request

                const existingUser = await User.findOne({ email })
                if (existingUser) {
                    throw new Error("User already exists")
                }

                const hashedPassword = await this.sha256(password)

                const user = new User({
                    uuid: uuidv4(),
                    email,
                    password: hashedPassword,
                    firstname,
                    lastname,
                    phone,
                    job,
                    desc,
                    picture: "default_profile_picture.png",
                })
                await user.save()
                const token = jwt.sign(
                    {
                        firstname,
                        lastname,
                        email,
                        picture: user.picture,
                        userId: user._id,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                )
                const message = {
                    signup_response: { etat: true, token },
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    signup_response: {
                        etat: false,
                        error: error.message,
                    },
                }
                this.controleur.envoie(this, message)
            }
        }

        if (mesg.users_list_request) {
            try {
                const users = await User.find(
                    {},
                    "firstname lastname email picture"
                )
                const formattedUsers = users.map((user) => ({
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    picture: user.picture,
                }))
                const message = {
                    users_list_response: {
                        etat: true,
                        users: formattedUsers,
                    },
                    id: [mesg.id],
                }
                console.log("on renvoie la response")

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
export default UsersService
