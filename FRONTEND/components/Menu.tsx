"use client"
import Image from "next/image"
import styles from "./Menu.module.css"
import { useAppContext } from "@/context/AppContext"
import Link from "next/link"

export default function Menu() {
    const { currentUser } = useAppContext()

    return (
        <section className={styles.section}>
            <div className={styles.menu}>
                <div>
                    <Link href="/" className={styles.logo}>
                        <Image
                            className={styles.logoImage}
                            src="/logo_Univ.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            priority
                        />
                        <h2 className={styles.menuText}>
                            Université de Toulon
                        </h2>
                    </Link>
                </div>
                <div>
                    <ul className={styles.allIcones}>
                        <Link href="/discussions" className={styles.link}>
                            <Image
                                src="/conversation.svg"
                                alt="Icone Conversation"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Discussions</h2>
                        </Link>
                        <Link href="/utilisateurs" className={styles.link}>
                            <Image
                                src="/users.svg"
                                alt="Icone User"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Utilisateurs</h2>
                        </Link>
                        <Link href="/files" className={styles.link}>
                            <Image
                                src="/folder.svg"
                                alt="Icone dossier"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Drive</h2>
                        </Link>
                        <Link href="/annuaire" className={styles.link}>
                            <Image
                                src="/livre.svg"
                                alt="Icone livre"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Annuaire</h2>
                        </Link>
                    </ul>
                </div>
            </div>
            <div>
                <div className={styles.profil}>
                    <Link href="/profil">
                        <Image
                            className={styles.profil}
                            src={
                                currentUser?.picture
                                    ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser.picture}`
                                    : `https://visioconfbucket.s3.eu-north-1.amazonaws.com/default_profile_picture.png`
                            }
                            alt="profil"
                            width={40}
                            height={40}
                            priority
                            unoptimized
                        />
                    </Link>
                </div>
            </div>
        </section>
    )
}
