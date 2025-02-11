"use client"
import { User } from "../types/User"
import styles from "./CurrentUser.module.css"

interface CurrentUserProps {
    user: User
}

export default function CurrentUser({ user }: CurrentUserProps) {
    console.log("user", user)

    return (
        <div className={styles.currentUser}>
            <p>
                {user.firstname} {user.lastname}
            </p>
            <p>{user.email}</p>
        </div>
    )
}
