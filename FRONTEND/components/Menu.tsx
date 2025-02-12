"use client";
import Image from "next/image";
import styles from './Menu.module.css';
import LinkTo from "@/components/LinkTo";

export default function Menu() {

    return (
        <section className={styles.section}>
            <div className={styles.menu}>
                <div>
                    <LinkTo to="/" className={styles.logo}>
                        <Image
                            className={styles.logoImage}
                            src="/logo_Univ.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            priority
                        />
                        <h2 className={styles.menuText}>Université de Toulon</h2>
                    </LinkTo>
                </div>
                <div>
                    <ul className={styles.allIcones}>
                        <LinkTo to="/discussions" className={styles.link}>
                            <Image
                                src="/conversation.svg"
                                alt="Icone Conversation"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Conversations</h2>
                        </LinkTo>
                        <LinkTo to="/utilisateurs" className={styles.link}>
                            <Image
                                src="/users.svg"
                                alt="Icone User"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Utilisateurs</h2>

                        </LinkTo>
                        <LinkTo to="/dossiers" className={styles.link}>
                            <Image
                                src="/folder.svg"
                                alt="Icone dossier"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Dossiers</h2>
                        </LinkTo>
                        <LinkTo to="/annuaire" className={styles.link}>
                            <Image
                                src="/livre.svg"
                                alt="Icone livre"
                                width={25}
                                height={25}
                                priority
                            />
                            <h2 className={styles.menuText}>Annuaire</h2>
                        </LinkTo>
                    </ul>
                </div>
            </div>
            <div>
                <div className={styles.profil}>
                    <LinkTo to="/">
                        <Image
                            className={styles.profil}
                            src="/profil.svg"
                            alt="profil"
                            width={40}
                            height={40}
                            priority
                        />
                    </LinkTo>
                </div>
            </div>
        </section>
    );
}
