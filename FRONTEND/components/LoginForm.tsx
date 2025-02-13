"use client"

import { useState, useEffect } from "react"
import styles from "./LoginForm.module.css"
import { useRouter } from "next/navigation"
import { useSocket } from "@/context/SocketProvider"
import jwt from "jsonwebtoken"
import { User } from "@/types/User"

export default function LoginForm() {
    const { controleur, currentUser, setCurrentUser } = useSocket()
    const listeMessageEmis = ["login_request"]
    const listeMessageRecus = ["login_response"]

    const nomDInstance = "LoginForm"
    const verbose = false

    const router = useRouter()

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            login_response?: {
                etat: boolean
                token?: string
            }
        }) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.login_response) {
                if (msg.login_response.etat === false) {
                    setError("Login failed. Please try again.")
                } else {
                    const token = msg.login_response.token
                    if (token) {
                        const user = jwt.decode(token) as User
                        setCurrentUser(user)
                        localStorage.setItem("token", token)
                    }
                    router.push("/")
                }
            }
        },
    }

    useEffect(() => {
        if (currentUser) {
            router.push("/")
        } else if (controleur) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
            return () => {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [controleur, currentUser])

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            let T = {
                login_request: { email, password },
            }
            controleur?.envoie(handler, T)
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
