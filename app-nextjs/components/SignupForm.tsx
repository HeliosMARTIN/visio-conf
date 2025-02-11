"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./SignupForm.module.css"
import getControleurInstance from "../singletonControleur"
import CanalSocketio from "../app/canalsocketio/canalsocketio"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

const controleur = getControleurInstance()
const socket = io
const canalSocketio = new CanalSocketio(socket, controleur, "socketIO")

export default function SignupForm() {
    // Messages
    const listeMessageEmis = ["inscription_requete"]
    const listeMessageRecus = ["inscription_reponse"]

    const nomDInstance = "SignupForm"
    const verbose = false

    const router = useRouter()

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            inscription_reponse?: {
                etat: string
                user?: { firstname: string; lastname: string; email: string }
            }
        }) => {
            if (verbose || controleur.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.inscription_reponse) {
                if (msg.inscription_reponse.etat === "false") {
                    setError("Signup failed. Please try again.")
                } else {
                    // Set cookies to stay logged in and store user info
                    Cookies.set("loggedIn", "true", { expires: 7 })
                    console.log("lalalalala", msg.inscription_reponse.user)

                    Cookies.set(
                        "userInfo",
                        JSON.stringify(msg.inscription_reponse.user),
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
            let T: {
                inscription_requete: {
                    login: string
                    mdp: string
                    firstname: string
                    lastname: string
                    user_phone: string
                    user_job: string
                    user_desc: string
                }
            } = {
                inscription_requete: {
                    login: "",
                    mdp: "",
                    firstname: "",
                    lastname: "",
                    user_phone: "",
                    user_job: "",
                    user_desc: "",
                },
            }
            T.inscription_requete = {
                login: email,
                mdp: password,
                firstname,
                lastname,
                user_phone: phone,
                user_job: job,
                user_desc: desc,
            }
            controleur.envoie(canalSocketio, T)
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
