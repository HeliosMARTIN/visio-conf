"use client"; // Ajoute cette ligne en haut du fichier

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import styles from "./profil.module.css";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { Pen } from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const { controleur, currentUser, setCurrentUser } = useAppContext()


    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [phone, setPhone] = useState("")
    const [job, setJob] = useState("")
    const [desc, setDesc] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loggedIn = Cookies.get("loggedIn");
        if (loggedIn) {
            router.push("/");
        }
    }, [router]);

    const handleEditClick = () => {
        setIsEditing(prev => !prev);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            let T = {
                signup_request: {
                    email,
                    password,
                    firstname,
                    lastname,
                    phone: phone,
                    job: job,
                    desc: desc,
                },
            }
            controleur?.envoie(T)
        } catch (err) {
            setError("Signup failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.profilSection}>
                    <Image
                        src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser?.picture}`}
                        alt="Profil"
                        className={styles.picture}
                        width={120}
                        height={120}
                        priority
                        unoptimized
                    />
                    <div className={styles.profil}>
                        <div className="profil__header">
                            <p>{currentUser?.desc}</p>
                            <Pen size={24} className={styles.pen} onClick={handleEditClick} />
                        </div>
                        <div className={styles.infos}>
                            <div className={styles.info}><h3>Nom</h3><p>{currentUser?.lastname}</p></div>
                            <div className={styles.info}><h3>Prénom</h3><p>{currentUser?.firstname}</p></div>
                            <div className={styles.info}><h3>Email</h3><p>{currentUser?.email}</p></div>
                            <div className={styles.info}><h3>Rôles</h3><p></p></div>
                        </div>
                    </div>
                </section>

                {/* Formulaire d'édition */}
                {isEditing && (
                    <section className={styles.editFormSection}>
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
                    </section>
                )}
            </main>
        </div>
    );
}
