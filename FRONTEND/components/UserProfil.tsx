"use client"
import { Pen } from "lucide-react"
import { User } from "../types/User"
import styles from "./CurrentUser.module.css"
import { useState } from "react"

interface CurrentUserProps {
    user: User
}

export default function UserProfil({ user }: CurrentUserProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(prev => !prev);
    };
    return (
        <div className={styles.currentUser}>
            <img
                src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
                alt="Profile picture"
                className={styles.picture}
                width={120}
                height={120}
            />
            <div className={styles.profil}>
                <div className="profil__header">
                    <p>{user.desc}</p>
                    <Pen size={24} className={styles.pen} onClick={handleEditClick} />
                </div>
                <div className={styles.infos}>
                    <div className={styles.info}><h3>Nom</h3><p>{user.lastname}</p></div>
                    <div className={styles.info}><h3>Prénom</h3><p>{user.firstname}</p></div>
                    <div className={styles.info}><h3>Email</h3><p>{user.email}</p></div>
                    <div className={styles.info}><h3>Rôles</h3><p></p></div>
                </div>
            </div>
        </div>
    )
}
