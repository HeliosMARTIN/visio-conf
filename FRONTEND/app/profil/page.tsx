"use client";

import { useAppContext } from "@/context/AppContext";
import styles from "./profilPage.module.css";
import UserProfil from "@/components/UserProfil";

export default function ProfilPage() {
    const { currentUser } = useAppContext()

    console.log(currentUser)
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.profilSection}>
                    {currentUser && <UserProfil user={currentUser} />}
                </section>
            </main>
        </div>
    );
}
