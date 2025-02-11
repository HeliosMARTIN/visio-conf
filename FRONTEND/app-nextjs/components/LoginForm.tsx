"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./LoginForm.module.css"
import CanalSocketio from "../controllers/canalsocketio"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Controleur from "@/controllers/controleur"

const controleur = new Controleur()
const socket = io
const canalSocketio = new CanalSocketio(socket, controleur, "socketIO")

export default function LoginForm() {
    // Messages
    const listeMessageEmis = ["connexion_requete"]
    const listeMessageRecus = ["connexion_reponse"]

    const nomDInstance = "LoginForm"
    const verbose = false

    const router = useRouter()

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            connexion_reponse?: {
                etat: string
                user?: { firstname: string; lastname: string; email: string }
            }
        }) => {
            if (verbose || controleur.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.connexion_reponse) {
                if (msg.connexion_reponse.etat === "false") {
                    setError("Login failed. Please try again.")
                } else {
                    // Set cookies to stay logged in and store user info
                    Cookies.set("loggedIn", "true", { expires: 7 })
                    Cookies.set(
                        "userInfo",
                        JSON.stringify(msg.connexion_reponse.user),
                        { expires: 7 }
                    )
                    router.push("/")
                }
            }
        },
    })

    useEffect(() => {
        controleur.inscription(current, listeMessageEmis, listeMessageRecus)

        return () => {
            controleur.desincription(
                current,
                listeMessageEmis,
                listeMessageRecus
            )
        }
    }, [current])

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            let T: { connexion_requete: { login: string; mdp: string } } = {
                connexion_requete: { login: "", mdp: "" },
            }
            T.connexion_requete = { login: email, mdp: password }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroup}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    )
}
