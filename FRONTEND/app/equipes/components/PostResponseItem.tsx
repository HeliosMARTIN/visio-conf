"use client"
import { useState } from "react"
import styles from "./PostResponseItem.module.css"
import { MoreVertical } from "lucide-react"

interface PostResponseItemProps {
    response: any
    currentUserId: string
}

export default function PostResponseItem({
    response,
    currentUserId,
}: PostResponseItemProps) {
    const [showOptions, setShowOptions] = useState(false)

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMins / 60)
            const diffDays = Math.floor(diffHours / 24)

            if (diffMins < 1) return "À l'instant"
            if (diffMins < 60)
                return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`
            if (diffHours < 24)
                return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
            if (diffDays < 7)
                return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`

            return date.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
        } catch (e) {
            return dateString
        }
    }

    const isAuthor = response.author._id === currentUserId

    return (
        <div
            className={`${styles.responseItem} ${
                isAuthor ? styles.authorResponse : ""
            }`}
        >
            <div className={styles.responseHeader}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {response.author.firstname.charAt(0)}
                        {response.author.lastname.charAt(0)}
                    </div>
                    <div>
                        <span className={styles.userName}>
                            {response.author.firstname}{" "}
                            {response.author.lastname}
                            {isAuthor && (
                                <span className={styles.authorBadge}>Vous</span>
                            )}
                        </span>
                        <span className={styles.timestamp}>
                            {formatDate(response.createdAt)}
                        </span>
                    </div>
                </div>
                <div className={styles.responseActions}>
                    <button
                        className={styles.optionsButton}
                        onClick={() => setShowOptions(!showOptions)}
                        aria-label="Options de la réponse"
                    >
                        <MoreVertical size={14} />
                    </button>
                    {showOptions && (
                        <div className={styles.optionsMenu}>
                            <button className={styles.optionItem}>
                                Copier le texte
                            </button>
                            {isAuthor && (
                                <button className={styles.optionItem}>
                                    Supprimer
                                </button>
                            )}
                            <button className={styles.optionItem}>
                                Signaler
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <p className={styles.responseText}>{response.content}</p>
        </div>
    )
}
