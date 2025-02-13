"use client"
import { User } from "../types/User"
import styles from "./UserInfo.module.css"
import { useRouter } from "next/navigation"

interface UserInfoProps {
    user: User
    currentUserEmail: string
}

export default function UserInfo({ user, currentUserEmail }: UserInfoProps) {
    const router = useRouter()

    const handleMessage = () => {
        router.push(`/message?id=${user.id}`)
    }

    if (user.email === currentUserEmail) return null

    return (
        <li className={styles.userInfo}>
            <img
                src={user.picture || "/images/default_picture_profile.png"}
                alt={`${user.firstname} profile picture`}
                className={styles.userImage}
            />
            <div className={styles.userDetails}>
                <span>
                    {user.firstname} {user.lastname}
                </span>
                <span className={styles.userEmail}>({user.email})</span>
            </div>
            <button className={styles.messageButton} onClick={handleMessage}>
                Envoyer un message
            </button>
        </li>
    )
}
