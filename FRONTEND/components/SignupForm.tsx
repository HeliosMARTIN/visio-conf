"use client"

import { useState, useEffect } from "react"
import styles from "./SignupForm.module.css"
import { useSocket } from "@/context/SocketProvider"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"

export default function SignupForm() {
    const { controleur, currentUser, setCurrentUser } = useSocket()
    const router = useRouter()
    // Messages
    const listeMessageEmis = ["signup_request"]
    const listeMessageRecus = ["signup_response"]

    const nomDInstance = "SignupForm"
    const verbose = false
    // Define the common handler instead of using useRef
    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            signup_response?: {
                etat: boolean
                token?: string
            }
        }) => {
            if (verbose || controleur.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.signup_response) {
                if (!msg.signup_response.etat) {
                    setError("Signup failed. Please try again.")
                } else {
                    const token = msg.signup_response.token
                    if (token) {
                        const user = jwt.decode(token)
                        setCurrentUser(user)
                        localStorage.setItem("token", token)
                    }
                    router.push("/")
                }
            }
        },
    }

    // Subscribe using the common controller instance
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
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [phone, setPhone] = useState("")
    const [job, setJob] = useState("")
    const [desc, setDesc] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            let T = {
                signup_request: {
                    login: email,
                    mdp: password,
                    firstname,
                    lastname,
                    phone: phone,
                    job: job,
                    desc: desc,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Signup failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles.signupForm} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="firstname">First Name:</label>
                    <input
                        type="text"
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="lastname">Last Name:</label>
                    <input
                        type="text"
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                    />
                </div>
            </div>
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
            <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone:</label>
                    <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="job">Job:</label>
                    <input
                        type="text"
                        id="job"
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="desc">Description:</label>
                <input
                    type="text"
                    id="desc"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
            >
                {loading ? "Signing up..." : "Sign Up"}
            </button>
        </form>
    )
}
