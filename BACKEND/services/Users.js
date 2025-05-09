import User from "../models/user.js"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"
import SocketIdentificationService from "./SocketIdentification.js"

class UsersService {
    controleur
    verbose = false
    listeDesMessagesEmis = new Array(
        "login_response",
        "signup_response",
        "users_list_response",
        "update_user_response",
        "user_info_response"
    )
    listeDesMessagesRecus = new Array(
        "login_request",
        "signup_request",
        "users_list_request",
        "update_user_request",
        "user_info_request"
    )

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
            await this.handleLogin(mesg)
        }

        if (mesg.signup_request) {
            await this.handleSignup(mesg)
        }

        if (mesg.users_list_request) {
            await this.getUsersList(mesg)
        }

        if (mesg.update_user_request) {
            await this.updateUser(mesg)
        }

        if (mesg.user_info_request) {
            await this.getUserInfo(mesg)
        }
    }

    async handleLogin(mesg) {
        try {
            const { email, password } = mesg.login_request

            const hashedPassword = await this.sha256(password)
            const user = await User.findOne({
                email,
                password: hashedPassword,
            })
            if (user) {
                const token = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
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

    async handleSignup(mesg) {
        try {
            const { email, password, firstname, lastname, phone, job, desc } =
                mesg.signup_request

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
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            )
            const message = {
                signup_response: { etat: true, token },
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

    async getUsersList(mesg) {
        try {
            const users = await User.find(
                {},
                "firstname lastname email picture phone"
            )
            const formattedUsers = users.map((user) => ({
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                picture: user.picture,
                phone: user.phone,
            }))
            const message = {
                users_list_response: {
                    etat: true,
                    users: formattedUsers,
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

    async updateUser(mesg) {
        try {
            const socketId = mesg.id
            if (!socketId)
                throw new Error("Sender socket id not available for update")
            // Use all received fields as update (partial update)
            const fieldsToUpdate = mesg.update_user_request
            // Retrieve user info based on socket id
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                )
            if (!userInfo) throw new Error("User not found based on socket id")
            // Update only the received fields
            const user = await User.findOneAndUpdate(
                { _id: userInfo._id },
                fieldsToUpdate,
                { new: true }
            )
            if (!user) throw new Error("User not found")
            const newUserInfo = {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                picture: user.picture,
                phone: user.phone,
            }
            const message = {
                update_user_response: {
                    etat: true,
                    newUserInfo,
                },
                id: [mesg.id],
            }
            this.controleur.envoie(this, message)
        } catch (error) {
            const message = {
                update_user_response: {
                    etat: false,
                    error: error.message,
                    newUserInfo: null,
                },
                id: [mesg.id],
            }
            this.controleur.envoie(this, message)
        }
    }

    async getUserInfo(mesg) {
        try {
            const { userId } = mesg.user_info_request
            const user = await User.findById(
                userId,
                "firstname lastname email picture phone"
            )

            if (user) {
                const userInfo = {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    picture: user.picture,
                    phone: user.phone,
                }
                const message = {
                    user_info_response: { etat: true, userInfo },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } else {
                throw new Error("User not found")
            }
        } catch (error) {
            const message = {
                user_info_response: { etat: false, error: error.message },
                id: [mesg.id],
            }
            this.controleur.envoie(this, message)
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
