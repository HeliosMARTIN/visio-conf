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
        router.push(
            `/message?firstName=${user.firstname}&lastName=${user.lastname}&email=${user.email}`
        )
    }

    if (user.email === currentUserEmail) return null

    return (
        <li className={styles.userInfo}>
            {user.firstname} {user.lastname} ({user.email})
            <button className={styles.messageButton} onClick={handleMessage}>
                Envoyer un message
            </button>
        </li>
    )
}
