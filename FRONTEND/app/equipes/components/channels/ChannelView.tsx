"use client"
import { useState, useEffect, useRef } from "react"
import styles from "./ChannelView.module.css"
import {
    Users,
    Send,
    HashIcon,
    Lock,
    MessageSquare,
    Settings,
} from "lucide-react"
import PostItem from "./PostItem"
import type { Channel } from "@/types/Channel"
import { useAppContext } from "@/context/AppContext"

interface ChannelViewProps {
    channel: Channel
    userId: string
    onEditChannel?: () => void
}

export default function ChannelView({
    channel,
    userId,
    onEditChannel,
}: ChannelViewProps) {
    const { controleur, canal } = useAppContext()
    const [posts, setPosts] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [newPostContent, setNewPostContent] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [showMembers, setShowMembers] = useState(false)
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>(
        {}
    )
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const nomDInstance = "ChannelView"
    const verbose = false

    const listeMessageEmis = [
        "channel_posts_request",
        "channel_members_request",
        "channel_post_create_request",
        "channel_post_response_create_request",
    ]
    const listeMessageRecus = [
        "channel_posts_response",
        "channel_members_response",
        "channel_post_create_response",
        "post_response_create_response",
        "new_channel_post",
        "new_post_response",
    ]

    // Assurons-nous que nous utilisons l'ID correct
    const channelId = channel.id

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.channel_posts_response) {
                if (msg.channel_posts_response.etat) {
                    setPosts(
                        (msg.channel_posts_response.posts || []).sort(
                            (a: any, b: any) =>
                                new Date(a.createdAt).getTime() -
                                new Date(b.createdAt).getTime()
                        )
                    )
                } else {
                    console.error(
                        "Erreur lors de la récupération des posts:",
                        msg.channel_posts_response.error
                    )
                }
                setIsLoading(false)
            }

            if (msg.channel_members_response) {
                if (msg.channel_members_response.etat) {
                    setMembers(msg.channel_members_response.members || [])
                } else {
                    console.error(
                        "Erreur lors de la récupération des membres:",
                        msg.channel_members_response.error
                    )
                }
            }

            if (msg.channel_post_create_response) {
                if (msg.channel_post_create_response.etat) {
                    setNewPostContent("")
                    // Le nouveau post sera ajouté via new_channel_post
                }
            }

            if (msg.new_channel_post) {
                if (
                    msg.new_channel_post.etat &&
                    msg.new_channel_post.channelId === channelId
                ) {
                    const newPost = {
                        ...msg.new_channel_post.post,
                        responses: [],
                    }
                    setPosts((prevPosts) => [newPost, ...prevPosts])
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({
                            behavior: "smooth",
                        })
                    }, 100)
                }
            }

            if (msg.post_response_create_response) {
                if (msg.post_response_create_response.etat) {
                    // La nouvelle réponse sera ajoutée via new_post_response
                }
            }

            if (msg.new_post_response) {
                if (
                    msg.new_post_response.etat &&
                    msg.new_post_response.channelId === channelId
                ) {
                    const postId = msg.new_post_response.postId
                    const newResponse = msg.new_post_response.response

                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post.id === postId
                                ? {
                                      ...post,
                                      responses: [
                                          ...(post.responses || []),
                                          newResponse,
                                      ],
                                      responseCount:
                                          (post.responseCount || 0) + 1,
                                  }
                                : post
                        )
                    )

                    // Si les réponses sont déjà affichées, faire défiler vers le bas
                    if (expandedPosts[postId]) {
                        setTimeout(() => {
                            const responseElement = document.getElementById(
                                `response-${newResponse.id}`
                            )
                            responseElement?.scrollIntoView({
                                behavior: "smooth",
                            })
                        }, 100)
                    }
                }
            }
        },
    }

    useEffect(() => {
        console.log("hereee use effect", channelId)

        if (controleur && canal && channelId) {
            console.log("hereeee channel view")

            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            // Récupérer les membres du canal
            const membersRequest = { channel_members_request: { channelId } }
            controleur.envoie(handler, membersRequest)

            // Récupérer les posts du canal
            const postsRequest = { channel_posts_request: { channelId } }
            controleur.envoie(handler, postsRequest)
        }

        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [channelId, controleur, canal])

    // Focus sur l'input quand le composant est monté
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const handleSubmitPost = () => {
        if (!newPostContent.trim() || !userId) return

        const postRequest = {
            channel_post_create_request: {
                channelId,
                content: newPostContent,
            },
        }
        controleur?.envoie(handler, postRequest)
    }

    const handleAddResponse = (postId: string, content: string) => {
        if (!content.trim() || !userId) return

        const responseRequest = {
            channel_post_response_create_request: {
                postId,
                content,
            },
        }
        controleur?.envoie(handler, responseRequest)
    }

    const handleToggleResponses = (postId: string) => {
        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }))
    }

    const isChannelCreator = channel.createdBy === userId
    const canPostMessage = isChannelCreator // Seul le créateur peut créer des posts

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.channelInfo}>
                    <div className={styles.channelIcon}>
                        {channel.isPublic ? (
                            <HashIcon size={20} />
                        ) : (
                            <Lock size={20} />
                        )}
                    </div>
                    <h2 className={styles.channelName}>{channel.name}</h2>
                    <div className={styles.channelStatus}>
                        <span
                            className={
                                channel.isPublic
                                    ? styles.publicBadge
                                    : styles.privateBadge
                            }
                        >
                            {channel.isPublic ? "Public" : "Privé"}
                        </span>
                    </div>
                    <button
                        className={styles.membersButton}
                        onClick={() => setShowMembers(!showMembers)}
                    >
                        <Users size={18} />
                        <span>
                            {members.length} membre
                            {members.length !== 1 ? "s" : ""}
                        </span>
                    </button>
                </div>

                {isChannelCreator && onEditChannel && (
                    <button
                        className={styles.settingsButton}
                        onClick={onEditChannel}
                    >
                        <Settings size={14} />
                    </button>
                )}
            </div>

            {showMembers && (
                <div className={styles.membersPanel}>
                    <h3 className={styles.membersPanelTitle}>
                        Membres du canal
                    </h3>

                    <div className={styles.membersList}>
                        {members.map((member) => (
                            <div
                                key={member.id || `member-${member.userId}`}
                                className={styles.memberItem}
                            >
                                <div className={styles.memberAvatar}>
                                    {member.picture ? (
                                        <img
                                            src={
                                                `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${member.picture}` ||
                                                "https://visioconfbucket.s3.eu-north-1.amazonaws.com/default_profile_picture.png"
                                            }
                                            alt={`${member.firstname} ${member.lastname}`}
                                        />
                                    ) : (
                                        <>
                                            {member.firstname?.charAt(0) || "?"}
                                            {member.lastname?.charAt(0) || "?"}
                                        </>
                                    )}
                                </div>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>
                                        {member.firstname} {member.lastname}
                                        {member.userId === userId && (
                                            <span className={styles.youBadge}>
                                                Vous
                                            </span>
                                        )}
                                    </span>
                                    <span className={styles.memberRole}>
                                        {member.role === "admin"
                                            ? "Administrateur"
                                            : "Membre"}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {members.length === 0 && (
                            <div className={styles.noResults}>
                                Aucun membre trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.postsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Chargement des messages...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} />
                        <p>Aucun message dans ce canal</p>
                        {canPostMessage && (
                            <p>Soyez le premier à écrire quelque chose !</p>
                        )}
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <div key={post.id} className={styles.postWrapper}>
                                <PostItem
                                    post={post}
                                    currentUserId={userId || ""}
                                    onToggleResponses={() =>
                                        handleToggleResponses(post.id)
                                    }
                                    isExpanded={!!expandedPosts[post.id]}
                                    onAddResponse={(content) =>
                                        handleAddResponse(post.id, content)
                                    }
                                    isAdmin={isChannelCreator}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {canPostMessage && (
                <div className={styles.inputContainer}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.messageInput}
                        placeholder="Écrivez un message..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmitPost()
                            }
                        }}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={handleSubmitPost}
                        disabled={!newPostContent.trim()}
                        aria-label="Envoyer le message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}
