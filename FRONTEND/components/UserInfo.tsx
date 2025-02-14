"use client"
import { User } from "../types/User"
import styles from "./UserInfo.module.css"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface UserInfoProps {
    user: User
    currentUserEmail: string
}

export default function UserInfo({ user, currentUserEmail }: UserInfoProps) {
    const router = useRouter()

    const handleMessage = () => {
        console.log("user", user)

        router.push(`/message?id=${user.id}`)
    }

    if (user.email === currentUserEmail) return null

    return (
        <li className={styles.userInfo}>
            <Image
                src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
                alt={`${user.firstname} profile picture`}
                width={50}
                height={50}
                unoptimized
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
