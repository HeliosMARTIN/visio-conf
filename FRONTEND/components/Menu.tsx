"use client";
import Image from "next/image";
import styles from './Menu.module.css';
import LinkTo from "@/components/LinkTo";

export default function Menu() {

    return (
        <section className={styles.section}>
            <div>
                <div>
                    <LinkTo to="/">
                        <Image
                            className={styles.logo}
                            src="/logo_iut.png"
                            alt="Logo"
                            width={50}
                            height={50}
                            priority
                        />
                    </LinkTo>
                </div>
                <div>
                    <ul className={styles.allIcones}>
                        <LinkTo to="/discussions">
                            <Image
                                className={styles.icones}
                                src="/conversation.svg"
                                alt="Icone Conversation"
                                width={30}
                                height={30}
                                priority
                            />
                        </LinkTo>
                        <LinkTo to="/utilisateurs">
                            <Image
                                className={styles.icones}
                                src="/users.svg"
                                alt="Icone User"
                                width={30}
                                height={30}
                                priority
                            />
                        </LinkTo>
                        <LinkTo to="/dossiers">
                            <Image
                                className={styles.icones}
                                src="/folder.svg"
                                alt="Icone dossier"
                                width={30}
                                height={30}
                                priority
                            />
                        </LinkTo>
                        <LinkTo to="/annuaire">
                            <Image
                                className={styles.icones}
                                src="/livre.svg"
                                alt="Icone livre"
                                width={30}
                                height={30}
                                priority
                            />
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
                            width={50}
                            height={50}
                            priority
                        />
                    </LinkTo>
                </div>
            </div>
        </section>
    );
}
