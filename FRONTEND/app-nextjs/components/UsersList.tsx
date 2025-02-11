"use client"
import { User } from "../app/types/User"
import UserInfo from "./UserInfo"
import styles from "./UsersList.module.css"

interface UsersListProps {
    users: User[]
    currentUserEmail: string
}

export default function UsersList({ users, currentUserEmail }: UsersListProps) {
    return (
        <ul className={styles.usersList}>
            {users.map((user, index) => (
                <UserInfo
                    key={index}
                    user={user}
                    currentUserEmail={currentUserEmail}
                />
            ))}
        </ul>
    )
}
