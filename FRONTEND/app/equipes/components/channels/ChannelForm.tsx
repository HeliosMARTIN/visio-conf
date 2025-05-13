"use client"
import { useState, useEffect } from "react"
import type React from "react"

import styles from "./ChannelForm.module.css"
import { useAppContext } from "@/context/AppContext"
import {
    HashIcon,
    Lock,
    Users,
    X,
    Check,
    MessageSquare,
    Search,
    Plus,
    Trash2,
} from "lucide-react"
import type { Team } from "@/types/Team"

interface User {
    id: string
    firstname: string
    lastname: string
    picture?: string
}

interface ChannelFormProps {
    onChannelCreated: (channel: any) => void
    onCancel: () => void
    channelToEdit?: any
    team: Team
}

export default function ChannelForm({
    onChannelCreated,
    onCancel,
    channelToEdit,
    team,
}: ChannelFormProps) {
    const { controleur, canal, currentUser } = useAppContext()
    const [name, setName] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [teamMembers, setTeamMembers] = useState<User[]>([])
    const [filteredMembers, setFilteredMembers] = useState<User[]>([])
    const [selectedMembers, setSelectedMembers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [isLoadingMembers, setIsLoadingMembers] = useState(false)
    const [channelMembers, setChannelMembers] = useState<any[]>([])

    const nomDInstance = "ChannelForm"
    const verbose = false

    const listeMessageEmis = [
        "channel_create_request",
        "channel_update_request",
        "team_members_request",
        "channel_members_request",
    ]
    const listeMessageRecus = [
        "channel_create_response",
        "channel_update_response",
        "team_members_response",
        "channel_members_response",
    ]

    useEffect(() => {
        if (channelToEdit) {
            setName(channelToEdit.name)
            setIsPublic(channelToEdit.isPublic)
            setIsEditing(true)

            // Récupérer les membres du canal existant
            if (!channelToEdit.isPublic) {
                loadChannelMembers(channelToEdit.id)
            }
        }

        // Charger tous les membres de l'équipe
        loadTeamMembers()
    }, [channelToEdit, team.id])

    useEffect(() => {
        // Filtrer les membres en fonction du terme de recherche
        if (teamMembers.length > 0) {
            const filtered = teamMembers.filter(
                (user) =>
                    `${user.firstname} ${user.lastname}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) &&
                    user.id !== currentUser?.id
            )
            setFilteredMembers(filtered)
        }
    }, [searchTerm, teamMembers, currentUser])

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
                    onChannelCreated(msg.channel_create_response.channel)
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
                    onChannelCreated(msg.channel_update_response.channel)
                } else {
                    setError(
                        msg.channel_update_response.error ||
                            "Erreur lors de la mise à jour du canal"
                    )
                }
            }

            if (msg.team_members_response) {
                setIsLoadingMembers(false)

                if (msg.team_members_response.etat) {
                    const members = msg.team_members_response.members || []
                    // Filtrer pour exclure l'utilisateur courant de la liste
                    const otherUsers = members
                        .filter(
                            (member: any) => member.userId !== currentUser?.id
                        )
                        .map((member: any) => ({
                            id: member.userId,
                            firstname: member.firstname,
                            lastname: member.lastname,
                            picture: member.picture,
                        }))

                    setTeamMembers(otherUsers)
                    setFilteredMembers(otherUsers)
                }
            }

            if (msg.channel_members_response) {
                if (msg.channel_members_response.etat) {
                    const members = msg.channel_members_response.members || []
                    setChannelMembers(members)

                    // Récupérer les utilisateurs qui sont membres
                    const memberUsers = members
                        .filter(
                            (member: any) => member.userId !== currentUser?.id
                        )
                        .map((member: any) => {
                            return {
                                id: member.userId,
                                firstname: member.firstname,
                                lastname: member.lastname,
                                picture: member.picture,
                            }
                        })

                    setSelectedMembers(memberUsers)
                }
            }
        },
    }

    const loadTeamMembers = () => {
        if (controleur && canal) {
            setIsLoadingMembers(true)
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            const request = {
                team_members_request: { teamId: team.id },
            }
            controleur.envoie(handler, request)
        }
    }

    const loadChannelMembers = (channelId: string) => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            const request = {
                channel_members_request: { channelId },
            }
            controleur.envoie(handler, request)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setError("Le nom du canal est requis")
            return
        }

        if (!isPublic && selectedMembers.length === 0) {
            setError(
                "Vous devez sélectionner au moins un membre pour un canal privé"
            )
            return
        }

        setIsLoading(true)
        setError("")

        controleur?.inscription(handler, listeMessageEmis, listeMessageRecus)

        if (isEditing) {
            // Mise à jour d'un canal existant
            const updateRequest = {
                channel_update_request: {
                    id: channelToEdit.id,
                    name,
                    isPublic,
                    teamId: team.id,
                    members: !isPublic
                        ? selectedMembers.map((member) => member.id)
                        : [],
                },
            }
            controleur?.envoie(handler, updateRequest)
        } else {
            // Création d'un nouveau canal
            const createRequest = {
                channel_create_request: {
                    name,
                    isPublic,
                    teamId: team.id,
                    members: !isPublic
                        ? selectedMembers.map((member) => member.id)
                        : [],
                },
            }
            controleur?.envoie(handler, createRequest)
        }
    }

    const handleCancel = () => {
        controleur?.desincription(handler, listeMessageEmis, listeMessageRecus)
        onCancel()
    }

    const toggleMember = (user: User) => {
        const isMemberSelected = selectedMembers.some(
            (member) => member.id === user.id
        )

        if (isMemberSelected) {
            // Retirer le membre
            setSelectedMembers(
                selectedMembers.filter((member) => member.id !== user.id)
            )
        } else {
            // Ajouter le membre
            setSelectedMembers([...selectedMembers, user])
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <MessageSquare size={24} className={styles.icon} />
                    <h2 className={styles.title}>
                        {isEditing
                            ? "Modifier le canal"
                            : "Créer un nouveau canal"}
                        <span className={styles.teamName}>
                            Équipe: {team.name}
                        </span>
                    </h2>
                </div>
                <button
                    className={styles.closeButton}
                    onClick={handleCancel}
                    aria-label="Fermer"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="channel-name" className={styles.label}>
                        Nom du canal
                    </label>
                    <div className={styles.inputWrapper}>
                        <MessageSquare size={18} className={styles.inputIcon} />
                        <input
                            id="channel-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Marketing, Support, Général..."
                            className={styles.input}
                            autoFocus
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Visibilité</label>
                    <div className={styles.visibilityOptions}>
                        <button
                            type="button"
                            className={`${styles.visibilityOption} ${
                                isPublic ? styles.selected : ""
                            }`}
                            onClick={() => setIsPublic(true)}
                        >
                            <HashIcon
                                size={18}
                                className={styles.visibilityIcon}
                            />
                            <div className={styles.optionContent}>
                                <span className={styles.optionTitle}>
                                    Public
                                </span>
                                <span className={styles.optionDescription}>
                                    Tous les membres de l'équipe peuvent voir et
                                    rejoindre ce canal
                                </span>
                            </div>
                            {isPublic && (
                                <Check size={18} className={styles.checkIcon} />
                            )}
                        </button>

                        <button
                            type="button"
                            className={`${styles.visibilityOption} ${
                                !isPublic ? styles.selected : ""
                            }`}
                            onClick={() => setIsPublic(false)}
                        >
                            <Lock size={18} className={styles.visibilityIcon} />
                            <div className={styles.optionContent}>
                                <span className={styles.optionTitle}>
                                    Privé
                                </span>
                                <span className={styles.optionDescription}>
                                    Seuls les membres invités peuvent accéder à
                                    ce canal
                                </span>
                            </div>
                            {!isPublic && (
                                <Check size={18} className={styles.checkIcon} />
                            )}
                        </button>
                    </div>
                </div>

                {!isPublic && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Membres</label>
                        <div className={styles.membersSelection}>
                            <div className={styles.searchContainer}>
                                <Search
                                    size={16}
                                    className={styles.searchIcon}
                                />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Rechercher des membres..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            {selectedMembers.length > 0 && (
                                <div className={styles.selectedMembers}>
                                    <h4 className={styles.selectedMembersTitle}>
                                        Membres sélectionnés (
                                        {selectedMembers.length})
                                    </h4>
                                    <div className={styles.membersList}>
                                        {selectedMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className={styles.memberItem}
                                            >
                                                <div
                                                    className={
                                                        styles.memberAvatar
                                                    }
                                                >
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
                                                            {member.firstname?.charAt(
                                                                0
                                                            ) || "?"}
                                                            {member.lastname?.charAt(
                                                                0
                                                            ) || "?"}
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.memberInfo
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.memberName
                                                        }
                                                    >
                                                        {member.firstname}{" "}
                                                        {member.lastname}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.removeButton
                                                    }
                                                    onClick={() =>
                                                        toggleMember(member)
                                                    }
                                                    aria-label={`Retirer ${member.firstname} ${member.lastname}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.usersList}>
                                <h4 className={styles.usersListTitle}>
                                    Ajouter des membres
                                </h4>
                                {isLoadingMembers ? (
                                    <div className={styles.loadingUsers}>
                                        Chargement des membres...
                                    </div>
                                ) : filteredMembers.length === 0 ? (
                                    <div className={styles.noResults}>
                                        Aucun membre trouvé
                                    </div>
                                ) : (
                                    filteredMembers
                                        .filter(
                                            (user) =>
                                                !selectedMembers.some(
                                                    (member) =>
                                                        member.id === user.id
                                                )
                                        )
                                        .map((user) => (
                                            <div
                                                key={user.id}
                                                className={styles.userItem}
                                            >
                                                <div
                                                    className={
                                                        styles.memberAvatar
                                                    }
                                                >
                                                    {user.picture ? (
                                                        <img
                                                            src={
                                                                `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}` ||
                                                                "https://visioconfbucket.s3.eu-north-1.amazonaws.com/default_profile_picture.png"
                                                            }
                                                            alt={`${user.firstname} ${user.lastname}`}
                                                        />
                                                    ) : (
                                                        <>
                                                            {user.firstname?.charAt(
                                                                0
                                                            ) || "?"}
                                                            {user.lastname?.charAt(
                                                                0
                                                            ) || "?"}
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.memberInfo
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
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.addButton}
                                                    onClick={() =>
                                                        toggleMember(user)
                                                    }
                                                    aria-label={`Ajouter ${user.firstname} ${user.lastname}`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleCancel}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.buttonSpinner}></div>
                                {isEditing ? "Mise à jour..." : "Création..."}
                            </>
                        ) : (
                            <>
                                <Users size={18} />
                                {isEditing
                                    ? "Mettre à jour le canal"
                                    : "Créer le canal"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
