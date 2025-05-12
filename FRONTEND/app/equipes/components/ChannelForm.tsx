"use client"
import { useState, useEffect } from "react"
import type React from "react"
import styles from "./ChannelForm.module.css"
import { useAppContext } from "@/context/AppContext"
import { Info, X, Plus, Users, Lock, Globe } from "lucide-react"
import type { Channel, ChannelMember, User } from "@/types/Channel"

interface ChannelFormProps {
    mode: "create" | "edit"
    channel: Channel | null
    onClose: () => void
}

export default function ChannelForm({
    mode,
    channel,
    onClose,
}: ChannelFormProps) {
    const { controleur, canal, currentUser } = useAppContext()
    const [name, setName] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [members, setMembers] = useState<string[]>([])
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([])
    const [showMembersList, setShowMembersList] = useState(false)

    const nomDInstance = "ChannelForm"
    const verbose = false

    const listeMessageEmis = [
        "channel_create_request",
        "channel_update_request",
        "channel_delete_request",
        "users_list_request",
        "channel_members_request",
    ]
    const listeMessageRecus = [
        "channel_create_response",
        "channel_update_response",
        "channel_delete_response",
        "users_list_response",
        "channel_members_response",
    ]

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.channel_create_response) {
                setIsLoading(false)
                if (msg.channel_create_response.etat) {
                    setSuccess("Canal créé avec succès")
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                } else {
                    setError(
                        msg.channel_create_response.error ||
                            "Erreur lors de la création du canal"
                    )
                }
            }

            if (msg.channel_update_response) {
                setIsLoading(false)
                if (msg.channel_update_response.etat) {
                    setSuccess("Canal mis à jour avec succès")
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                } else {
                    setError(
                        msg.channel_update_response.error ||
                            "Erreur lors de la mise à jour du canal"
                    )
                }
            }

            if (msg.channel_delete_response) {
                setIsLoading(false)
                if (msg.channel_delete_response.etat) {
                    setSuccess("Canal supprimé avec succès")
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                } else {
                    setError(
                        msg.channel_delete_response.error ||
                            "Erreur lors de la suppression du canal"
                    )
                }
            }

            if (msg.users_list_response) {
                if (msg.users_list_response.etat) {
                    setAllUsers(msg.users_list_response.users || [])
                }
            }

            if (msg.channel_members_response) {
                if (msg.channel_members_response.etat) {
                    setChannelMembers(
                        msg.channel_members_response.members || []
                    )
                    // Extract user IDs from members
                    const memberIds = msg.channel_members_response.members.map(
                        (m: ChannelMember) => m.userId
                    )
                    setMembers(memberIds)
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            // Fetch users list
            const T = { users_list_request: {} }
            controleur.envoie(handler, T)

            // If editing, fetch channel members
            if (mode === "edit" && channel) {
                const T2 = {
                    channel_members_request: { channelId: channel.id },
                }
                controleur.envoie(handler, T2)
            }
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
    }, [])

    useEffect(() => {
        if (mode === "edit" && channel) {
            setName(channel.name)
            setIsPublic(channel.isPublic)
            setShowMembersList(true)
        }
    }, [mode, channel])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!name.trim()) {
            setError("Le nom du canal est requis")
            return
        }

        setIsLoading(true)

        if (mode === "create") {
            const T = {
                channel_create_request: {
                    name: name.trim(),
                    teamId: "default", // In a real app, you'd get this from context or props
                    isPublic,
                    members: !isPublic ? members : undefined,
                },
            }
            controleur?.envoie(handler, T)
        } else if (mode === "edit" && channel) {
            const T = {
                channel_update_request: {
                    id: channel.id,
                    name: name.trim(),
                    isPublic,
                },
            }
            controleur?.envoie(handler, T)
        }
    }

    const handleDelete = () => {
        if (!channel) return

        if (
            window.confirm(
                "Êtes-vous sûr de vouloir supprimer ce canal ? Cette action est irréversible."
            )
        ) {
            setIsLoading(true)
            const T = {
                channel_delete_request: {
                    channelId: channel.id,
                },
            }
            controleur?.envoie(handler, T)
        }
    }

    const toggleMember = (userId: string) => {
        if (members.includes(userId)) {
            setMembers(members.filter((id) => id !== userId))
        } else {
            setMembers([...members, userId])
        }
    }

    const filteredUsers = allUsers.filter(
        (user) =>
            user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Find user details for channel members
    const getMemberDetails = (userId: string) => {
        return allUsers.find((user) => user.id === userId) || null
    }

    // Get member role
    const getMemberRole = (userId: string) => {
        const member = channelMembers.find((m) => m.userId === userId)
        return member ? member.role : "member"
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {mode === "create"
                        ? "Ajouter un canal"
                        : "Modifier un canal"}
                </h2>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    <Info size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className={styles.successMessage}>
                    <Info size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div className={styles.formContainer}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="channelName">Nom du canal</label>
                        <input
                            type="text"
                            id="channelName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Entrez le nom du canal"
                            className={styles.input}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.sectionTitle}>
                            Paramètres du canal
                        </label>
                        <div className={styles.visibilitySection}>
                            <p className={styles.visibilityLabel}>
                                Visibilité du canal
                            </p>

                            <div className={styles.radioGroup}>
                                <label
                                    className={`${styles.radioCard} ${
                                        isPublic ? styles.selected : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={isPublic}
                                        onChange={() => setIsPublic(true)}
                                        disabled={isLoading}
                                        className={styles.radioInput}
                                    />
                                    <div className={styles.radioContent}>
                                        <div className={styles.radioIcon}>
                                            <Globe size={20} />
                                        </div>
                                        <div className={styles.radioText}>
                                            <span className={styles.radioTitle}>
                                                Canal public
                                            </span>
                                            <span
                                                className={
                                                    styles.radioDescription
                                                }
                                            >
                                                Tous les membres peuvent
                                                rejoindre et voir les messages
                                            </span>
                                        </div>
                                    </div>
                                </label>

                                <label
                                    className={`${styles.radioCard} ${
                                        !isPublic ? styles.selected : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        checked={!isPublic}
                                        onChange={() => setIsPublic(false)}
                                        disabled={isLoading}
                                        className={styles.radioInput}
                                    />
                                    <div className={styles.radioContent}>
                                        <div className={styles.radioIcon}>
                                            <Lock size={20} />
                                        </div>
                                        <div className={styles.radioText}>
                                            <span className={styles.radioTitle}>
                                                Canal privé
                                            </span>
                                            <span
                                                className={
                                                    styles.radioDescription
                                                }
                                            >
                                                Seuls les membres invités
                                                peuvent voir les messages
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {mode === "edit" && (
                        <div className={styles.formGroup}>
                            <div className={styles.membersHeader}>
                                <label className={styles.sectionTitle}>
                                    <Users
                                        size={18}
                                        className={styles.sectionIcon}
                                    />
                                    Membres du canal
                                </label>
                                <button
                                    type="button"
                                    className={styles.toggleButton}
                                    onClick={() =>
                                        setShowMembersList(!showMembersList)
                                    }
                                >
                                    {showMembersList ? "Masquer" : "Afficher"}
                                </button>
                            </div>

                            {showMembersList && (
                                <div className={styles.currentMembersList}>
                                    {channelMembers.length > 0 ? (
                                        channelMembers.map((member) => {
                                            const user = getMemberDetails(
                                                member.userId
                                            )
                                            const role = getMemberRole(
                                                member.userId
                                            )

                                            if (!user) return null

                                            return (
                                                <div
                                                    key={member.userId}
                                                    className={
                                                        styles.memberListItem
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.memberInfo
                                                        }
                                                    >
                                                        {user.picture ? (
                                                            <img
                                                                src={
                                                                    user.picture ||
                                                                    "/placeholder.svg"
                                                                }
                                                                alt={`${user.firstname} ${user.lastname}`}
                                                                className={
                                                                    styles.memberAvatar
                                                                }
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    styles.memberInitials
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        role ===
                                                                        "admin"
                                                                            ? "#4f46e5"
                                                                            : "#6b7280",
                                                                }}
                                                            >
                                                                {
                                                                    user
                                                                        .firstname[0]
                                                                }
                                                                {
                                                                    user
                                                                        .lastname[0]
                                                                }
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                styles.memberDetails
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.memberName
                                                                }
                                                            >
                                                                {user.firstname}{" "}
                                                                {user.lastname}
                                                            </span>
                                                            <span
                                                                className={
                                                                    styles.memberEmail
                                                                }
                                                            >
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.memberRole
                                                        }
                                                    >
                                                        <span
                                                            className={`${
                                                                styles.roleBadge
                                                            } ${
                                                                role === "admin"
                                                                    ? styles.adminBadge
                                                                    : styles.memberBadge
                                                            }`}
                                                        >
                                                            {role === "admin"
                                                                ? "Admin"
                                                                : "Membre"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className={styles.emptyMembers}>
                                            <p>Aucun membre dans ce canal</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!isPublic && (
                        <div className={styles.formGroup}>
                            <label className={styles.sectionTitle}>
                                {mode === "create"
                                    ? "Ajouter des membres"
                                    : "Inviter des membres"}
                            </label>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Rechercher des utilisateurs..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className={styles.searchInput}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles.membersList}>
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`${styles.memberItem} ${
                                            members.includes(user.id)
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => toggleMember(user.id)}
                                    >
                                        <div className={styles.memberInfo}>
                                            {user.picture ? (
                                                <img
                                                    src={
                                                        user.picture ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={user.firstname}
                                                    className={
                                                        styles.memberAvatar
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        styles.memberInitials
                                                    }
                                                >
                                                    {user.firstname[0]}
                                                    {user.lastname[0]}
                                                </div>
                                            )}
                                            <span className={styles.memberName}>
                                                {user.firstname} {user.lastname}
                                            </span>
                                        </div>
                                        <div className={styles.memberAction}>
                                            {members.includes(user.id) ? (
                                                <X size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        {mode === "edit" && (
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                Supprimer
                            </button>
                        )}
                        <div className={styles.rightActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Chargement..."
                                    : mode === "create"
                                    ? "Créer"
                                    : "Mettre à jour"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
