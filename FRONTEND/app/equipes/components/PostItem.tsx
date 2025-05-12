"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import styles from "./PostItem.module.css"
import { MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react"
import PostResponseItem from "./PostResponseItem"

interface PostItemProps {
    post: any
    currentUserId: string
    onToggleResponses: () => void
    isExpanded: boolean
    onAddResponse: (content: string) => void
}

export default function PostItem({
    post,
    currentUserId,
    onToggleResponses,
    isExpanded,
    onAddResponse,
}: PostItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [replyContent, setReplyContent] = useState("")

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

    const handleSubmitReply = () => {
        if (!replyContent.trim()) return

        onAddResponse(replyContent)
        setReplyContent("")
        setShowReplyForm(false)
    }

    const isAuthor = post.authorId === currentUserId
    const responseCount = post.responseCount || 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.postItem}
        >
            <div className={styles.postHeader}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {post.authorAvatar ? (
                            <img
                                src={post.authorAvatar || "/placeholder.svg"}
                                alt={post.authorName}
                            />
                        ) : (
                            post.authorName
                                ?.split(" ")
                                .map((n: string) => n.charAt(0))
                                .join("")
                        )}
                    </div>
                    <div>
                        <span className={styles.userName}>
                            {post.authorName}
                            {isAuthor && (
                                <span className={styles.authorBadge}>Vous</span>
                            )}
                        </span>
                        <span className={styles.timestamp}>
                            {formatDate(post.createdAt)}
                        </span>
                    </div>
                </div>
                <div className={styles.postActions}>
                    {/* Removed options button and menu */}
                </div>
            </div>

            <p className={styles.postText}>{post.content}</p>

            <div className={styles.postFooter}>
                <button
                    className={styles.replyButton}
                    onClick={() => setShowReplyForm(!showReplyForm)}
                >
                    <MessageCircle size={16} />
                    <span>Répondre</span>
                </button>
            </div>

            {showReplyForm && (
                <div className={styles.replyForm}>
                    <textarea
                        className={styles.replyInput}
                        placeholder="Écrivez votre réponse..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                    />
                    <button
                        className={styles.replySubmitButton}
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim()}
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}

            {responseCount > 0 && (
                <button
                    className={styles.responsesToggle}
                    onClick={onToggleResponses}
                >
                    <div className={styles.responsesInfo}>
                        <MessageCircle size={16} />
                        <span>
                            {responseCount} réponse
                            {responseCount > 1 ? "s" : ""}
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </button>
            )}

            {isExpanded && post.responses && post.responses.length > 0 && (
                <div className={styles.responsesContainer}>
                    {post.responses.map((response: any) => (
                        <PostResponseItem
                            key={
                                response._id ||
                                response.id ||
                                `response-${response.authorId}-${Date.parse(
                                    response.createdAt
                                )}`
                            }
                            response={response}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}
