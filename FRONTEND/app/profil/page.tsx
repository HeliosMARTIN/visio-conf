"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import styles from "./profil.module.css"
import { useAppContext } from "@/context/AppContext"
import Image from "next/image";

export default function ProfilPage() {
    const router = useRouter()
    const { currentUser } = useAppContext()

    useEffect(() => {
        const loggedIn = Cookies.get("loggedIn")
        if (loggedIn) {
            router.push("/")
        }
    }, [router])

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.profilSection}>
                    <Image
                        src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser?.picture}`}
                        alt="Profil"
                        className={styles.picture}
                        width={90}
                        height={90}
                        priority
                        unoptimized

                    />
                    <div className={styles.profil}>
                        <p>{currentUser?.desc}</p>
                        <div className={styles.infos}>
                            <div className={styles.info}><h3>Nom</h3><p>{currentUser?.lastname}</p></div>
                            <div className={styles.info}><h3>Prénom</h3><p>{currentUser?.firstname}</p></div>
                            <div className={styles.info}><h3>Compte crée</h3><p></p></div>
                            <div className={styles.info}><h3>Email</h3><p>{currentUser?.email}</p></div>
                            <div className={styles.info}><h3>Rôles</h3><p></p></div>
                        </div>
                    </div>
                </section>
                <section></section>
            </main>
        </div>
    )
}
