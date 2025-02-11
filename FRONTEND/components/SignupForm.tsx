"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./SignupForm.module.css"
import { CanalSocketio } from "../controllers/canalsocketio"
import io from "socket.io-client"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Controleur from "@/controllers/controleur"

const controleur = new Controleur()
const socket = io
const canalSocketio = new CanalSocketio(controleur, "socketIO")

export default function SignupForm() {
    // Messages
    const listeMessageEmis = ["signup_request"]
    const listeMessageRecus = ["signup_response"]

    const nomDInstance = "SignupForm"
    const verbose = false

    const router = useRouter()

    const { current } = useRef({
        nomDInstance,
        traitementMessage: (msg: {
            signup_response?: {
                etat: boolean
                user?: { firstname: string; lastname: string; email: string }
            }
        }) => {
            if (msg.signup_response) {
                if (msg.signup_response.etat === true && msg.signup_response.user) {
                    // Set cookies with user information
                    Cookies.set("userInfo", JSON.stringify({
                        email: msg.signup_response.user.email,
                        firstname: msg.signup_response.user.firstname,
                        lastname: msg.signup_response.user.lastname
                    }))
                    Cookies.set("loggedIn", "true")
                    router.push("/")
                } else {
                    setError("Signup failed. Please try again.")
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
                signup_request: {
                    login: string
                    mdp: string
                    firstname: string
                    lastname: string
                    user_phone: string
                    user_job: string
                    user_desc: string
                }
            } = {
                signup_request: {
                    login: "",
                    mdp: "",
                    firstname: "",
                    lastname: "",
                    user_phone: "",
                    user_job: "",
                    user_desc: "",
                },
            }
            T.signup_request = {
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
