"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./LoginForm.module.css"
import { CanalSocketio } from "../controllers/canalsocketio"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Controleur from "@/controllers/controleur"

const controleur = new Controleur()
const socket = io
const canalSocketio = new CanalSocketio(controleur, "socketIO")

export default function LoginForm() {
    // Messages
    const listeMessageEmis = ["login_request"]
    const listeMessageRecus = ["login_response"]

    const nomDInstance = "LoginForm"
    const verbose = false

    const router = useRouter()

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            login_response?: {
                etat: boolean
                user?: { firstname: string; lastname: string; email: string }
            }
        }) => {
            if (msg.login_response) {
                if (msg.login_response.etat === true && msg.login_response.user) {
                    // Set cookies with user information
                    Cookies.set("userInfo", JSON.stringify({
                        email: msg.login_response.user.email,
                        firstname: msg.login_response.user.firstname,
                        lastname: msg.login_response.user.lastname
                    }))
                    Cookies.set("loggedIn", "true")
                    router.push("/")
                } else {
                    setError("La connexion a échoué. Veuillez vérifier vos informations d'identification.")
                }
            }
        }
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
            let T: { login_request: { login: string; mdp: string } } = {
                login_request: { login: "", mdp: "" },
            }
            T.login_request = { login: email, mdp: password }
            controleur.envoie(canalSocketio, T)
        } catch (err) {
            setError("La connexion a échoué. Veuillez réessayer.")
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
                <label htmlFor="password">Mot de passe:</label>
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
                {loading ? "Connexion en cours..." : "Connexion"}
            </button>
        </form>
    )
}
