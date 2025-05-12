"use client"
import { useState, useEffect, useRef } from "react"
import styles from "./ChannelView.module.css"
import { Users, Send, MessageSquare } from "lucide-react"
import PostItem from "./PostItem"
import type { Channel } from "@/types/Channel"
import { useAppContext } from "@/context/AppContext"

interface ChannelViewProps {
    channel: Channel
    onEditChannel?: () => void
}

export default function ChannelView({
    channel,
    onEditChannel,
}: ChannelViewProps) {
    const { controleur, canal, currentUser } = useAppContext()
    const [posts, setPosts] = useState<any[]>([])
    const [members, setMembers] = useState<any[]>([])
    const [newPostContent, setNewPostContent] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [showMembers, setShowMembers] = useState(false)
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>(
        {}
    )
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const nomDInstance = "ChannelView"
    const verbose = false

    const listeMessageEmis = [
        "channel_posts_request",
        "channel_members_request",
        "channel_post_create_request",
        "channel_post_responses_request",
        "channel_post_response_create_request",
    ]
    const listeMessageRecus = [
        "channel_posts_response",
        "channel_members_response",
        "channel_post_create_response",
        "channel_post_responses_response",
        "channel_post_response_create_response",
    ]

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
                    setPosts(msg.channel_posts_response.posts || [])
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
                    // Récupérer les informations complètes des membres
                    fetchMembersInfo(msg.channel_members_response.members || [])
                } else {
                    console.error(
                        "Erreur lors de la récupération des membres:",
                        msg.channel_members_response.error
                    )
                }
            }

            if (msg.channel_post_create_response) {
                if (msg.channel_post_create_response.etat) {
                    // Ajouter le nouveau post à la liste
                    setPosts((prevPosts) => [
                        ...prevPosts,
                        msg.channel_post_create_response.post,
                    ])
                    setNewPostContent("")

                    // Faire défiler vers le bas
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({
                            behavior: "smooth",
                        })
                    }, 100)
                } else {
                    console.error(
                        "Erreur lors de la création du post:",
                        msg.channel_post_create_response.error
                    )
                }
            }

            if (msg.channel_post_responses_response) {
                if (msg.channel_post_responses_response.etat) {
                    const postId = msg.channel_post_responses_response.postId
                    const responses =
                        msg.channel_post_responses_response.responses || []

                    // Mettre à jour les réponses du post
                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post._id === postId ? { ...post, responses } : post
                        )
                    )
                }
            }

            if (msg.channel_post_response_create_response) {
                if (msg.channel_post_response_create_response.etat) {
                    const postId =
                        msg.channel_post_response_create_response.postId
                    const newResponse =
                        msg.channel_post_response_create_response.response

                    // Ajouter la nouvelle réponse au post
                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post._id === postId
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
                }
            }
        },
    }

    // Fonction pour récupérer les informations complètes des membres
    const fetchMembersInfo = async (membersList: any[]) => {
        const membersWithInfo = await Promise.all(
            membersList.map(async (member) => {
                // Récupérer les informations de l'utilisateur
                const userInfoRequest = {
                    user_info_request: { userId: member.userId },
                }

                return new Promise((resolve) => {
                    const userInfoHandler = {
                        nomDInstance: "MemberInfoHandler",
                        traitementMessage: (msg: any) => {
                            if (msg.user_info_response) {
                                controleur?.desincription(
                                    userInfoHandler,
                                    [],
                                    ["user_info_response"]
                                )

                                if (msg.user_info_response.etat) {
                                    const userInfo =
                                        msg.user_info_response.userInfo
                                    resolve({
                                        ...member,
                                        firstname: userInfo.firstname,
                                        lastname: userInfo.lastname,
                                        picture: userInfo.picture,
                                    })
                                } else {
                                    resolve({
                                        ...member,
                                        firstname: "Utilisateur",
                                        lastname: "Inconnu",
                                        picture: null,
                                    })
                                }
                            }
                        },
                    }

                    controleur?.inscription(
                        userInfoHandler,
                        [],
                        ["user_info_response"]
                    )
                    controleur?.envoie(userInfoHandler, userInfoRequest)
                })
            })
        )

        setMembers(membersWithInfo as any[])
    }

    useEffect(() => {
        if (controleur && canal && channel.id) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            // Récupérer les posts du canal
            const postsRequest = {
                channel_posts_request: { channelId: channel.id },
            }
            controleur.envoie(handler, postsRequest)

            // Récupérer les membres du canal
            const membersRequest = {
                channel_members_request: { channelId: channel.id },
            }
            controleur.envoie(handler, membersRequest)
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
    }, [channel.id, controleur, canal])

    const handleSubmitPost = () => {
        if (!newPostContent.trim()) return

        const postRequest = {
            channel_post_create_request: {
                channelId: channel.id,
                content: newPostContent,
            },
        }
        controleur?.envoie(handler, postRequest)
    }

    const handleAddResponse = (postId: string, content: string) => {
        if (!content.trim()) return

        const responseRequest = {
            channel_post_response_create_request: {
                postId,
                content,
            },
        }
        controleur?.envoie(handler, responseRequest)
    }

    const handleToggleResponses = (postId: string) => {
        // Si les réponses ne sont pas encore chargées, les récupérer
        const post = posts.find((p) => p._id === postId)
        if (!post.responses && post.responseCount > 0) {
            const responsesRequest = {
                channel_post_responses_request: {
                    postId,
                },
            }
            controleur?.envoie(handler, responsesRequest)
        }

        setExpandedPosts((prev) => ({
            ...prev,
            [postId]: !prev[postId],
        }))
    }

    const isAdmin = members.some(
        (member) =>
            member.userId === currentUser?._id && member.role === "admin"
    )

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.channelInfo}>
                    <div className={styles.channelIcon}>
                        <MessageSquare size={20} />
                    </div>
                    <h2 className={styles.channelName}>{channel.name}</h2>
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

                {isAdmin && onEditChannel && (
                    <button
                        className={styles.settingsButton}
                        onClick={onEditChannel}
                    >
                        <span className={styles.settingsIcon}>⚙️</span>
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
                                key={
                                    member.userId ||
                                    member._id ||
                                    `member-${member.firstname}-${member.lastname}`
                                }
                                className={styles.memberItem}
                            >
                                <div className={styles.memberAvatar}>
                                    {member.picture ? (
                                        <img
                                            src={
                                                member.picture ||
                                                "/placeholder.svg"
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
                                        {member.userId === currentUser?._id && (
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
                    </div>
                </div>
            )}

            <div className={styles.postsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        Chargement des messages...
                    </div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} />
                        <p>Aucun message dans ce canal</p>
                        <p>Soyez le premier à écrire quelque chose !</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <div key={post.id} className={styles.postWrapper}>
                                <PostItem
                                    post={post}
                                    currentUserId={currentUser?._id || ""}
                                    onToggleResponses={() =>
                                        handleToggleResponses(post.id)
                                    }
                                    isExpanded={!!expandedPosts[post.id]}
                                    onAddResponse={(content) =>
                                        handleAddResponse(post.id, content)
                                    }
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className={styles.inputContainer}>
                <input
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
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
