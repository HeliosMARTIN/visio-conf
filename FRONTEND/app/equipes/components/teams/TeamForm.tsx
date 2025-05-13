"use client"
import { useState, useEffect } from "react"
import type React from "react"
import styles from "./TeamForm.module.css"
import { useAppContext } from "@/context/AppContext"
import { Users, X, Search, Plus, Trash2, AlertCircle } from "lucide-react"
import type { Team, TeamMember } from "@/types/Team"
import { User } from "@/types/User"

interface TeamFormProps {
    onTeamCreated: (team: Team) => void
    onCancel: () => void
    teamToEdit?: Team | null
}

export default function TeamForm({
    onTeamCreated,
    onCancel,
    teamToEdit,
}: TeamFormProps) {
    const { controleur, canal, currentUser } = useAppContext()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [usersList, setUsersList] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [selectedMembers, setSelectedMembers] = useState<User[]>([])
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [isLoadingMembers, setIsLoadingMembers] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const nomDInstance = "TeamForm"
    const verbose = false

    const listeMessageEmis = [
        "team_create_request",
        "team_update_request",
        "team_delete_request",
        "users_list_request",
        "team_members_request",
        "team_add_member_request",
        "team_remove_member_request",
    ]
    const listeMessageRecus = [
        "team_create_response",
        "team_update_response",
        "team_delete_response",
        "users_list_response",
        "team_members_response",
        "team_add_member_response",
        "team_remove_member_response",
    ]

    useEffect(() => {
        // Charger tous les utilisateurs pour la sélection des membres
        loadUsers()

        // Si on est en mode édition, charger les détails de l'équipe
        if (teamToEdit) {
            setName(teamToEdit.name || "")
            setDescription(teamToEdit.description || "")
            setIsEditing(true)
            loadTeamMembers(teamToEdit.id)
        }

        return () => {
            controleur?.desincription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            )
        }
    }, [teamToEdit])

    useEffect(() => {
        // Filtrer les utilisateurs en fonction du terme de recherche
        if (usersList.length > 0) {
            const filtered = usersList.filter(
                (user) =>
                    `${user.firstname} ${user.lastname}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) &&
                    user.id !== currentUser?.id &&
                    !teamMembers.some((member) => member.userId === user.id) &&
                    !selectedMembers.some((member) => member.id === user.id)
            )
            setFilteredUsers(filtered)
        }
    }, [searchTerm, usersList, teamMembers, selectedMembers, currentUser])

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.team_create_response) {
                setIsLoading(false)

                if (msg.team_create_response.etat) {
                    onTeamCreated(msg.team_create_response.team)
                } else {
                    setError(
                        msg.team_create_response.error ||
                            "Erreur lors de la création de l'équipe"
                    )
                }
            }

            if (msg.team_update_response) {
                setIsLoading(false)

                if (msg.team_update_response.etat) {
                    onTeamCreated(msg.team_update_response.team)
                } else {
                    setError(
                        msg.team_update_response.error ||
                            "Erreur lors de la mise à jour de l'équipe"
                    )
                }
            }

            if (msg.team_delete_response) {
                setIsDeleting(false)

                if (msg.team_delete_response.etat) {
                    onTeamCreated({ ...teamToEdit, deleted: true } as Team)
                } else {
                    setError(
                        msg.team_delete_response.error ||
                            "Erreur lors de la suppression de l'équipe"
                    )
                }
            }

            if (msg.users_list_response) {
                setIsLoadingUsers(false)

                if (msg.users_list_response.etat) {
                    const users = msg.users_list_response.users || []
                    setUsersList(users)
                }
            }

            if (msg.team_members_response) {
                setIsLoadingMembers(false)

                if (msg.team_members_response.etat) {
                    const members = msg.team_members_response.members || []
                    setTeamMembers(members)
                }
            }

            if (msg.team_add_member_response) {
                setIsLoading(false)

                if (msg.team_add_member_response.etat) {
                    // Recharger les membres de l'équipe
                    if (teamToEdit) {
                        loadTeamMembers(teamToEdit.id)
                        setSuccessMessage("Membre ajouté avec succès")
                        setTimeout(() => setSuccessMessage(""), 3000)
                    }
                } else {
                    setError(
                        msg.team_add_member_response.error ||
                            "Erreur lors de l'ajout du membre"
                    )
                }
            }

            if (msg.team_remove_member_response) {
                setIsLoading(false)

                if (msg.team_remove_member_response.etat) {
                    // Recharger les membres de l'équipe
                    if (teamToEdit) {
                        loadTeamMembers(teamToEdit.id)
                        setSuccessMessage("Membre retiré avec succès")
                        setTimeout(() => setSuccessMessage(""), 3000)
                    }
                } else {
                    setError(
                        msg.team_remove_member_response.error ||
                            "Erreur lors de la suppression du membre"
                    )
                }
            }
        },
    }

    const loadUsers = () => {
        if (controleur && canal) {
            setIsLoadingUsers(true)
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            const request = {
                users_list_request: {},
            }
            controleur.envoie(handler, request)
        }
    }

    const loadTeamMembers = (teamId: string) => {
        if (controleur && canal) {
            setIsLoadingMembers(true)
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            const request = {
                team_members_request: { teamId },
            }
            controleur.envoie(handler, request)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setError("Le nom de l'équipe est requis")
            return
        }

        if (!isEditing && selectedMembers.length === 0) {
            setError(
                "Vous devez sélectionner au moins un membre pour créer une équipe"
            )
            return
        }

        setIsLoading(true)
        setError("")

        controleur?.inscription(handler, listeMessageEmis, listeMessageRecus)

        if (isEditing && teamToEdit) {
            // Mise à jour d'une équipe existante
            const updateRequest = {
                team_update_request: {
                    id: teamToEdit.id,
                    name,
                    description,
                },
            }
            controleur?.envoie(handler, updateRequest)
        } else {
            // Création d'une nouvelle équipe
            const createRequest = {
                team_create_request: {
                    name,
                    description,
                    members: selectedMembers.map((member) => member.id),
                },
            }
            controleur?.envoie(handler, createRequest)
        }
    }

    const handleDeleteTeam = () => {
        if (!controleur || !canal || !teamToEdit) return

        setIsDeleting(true)
        setError("")

        const request = {
            team_delete_request: {
                teamId: teamToEdit.id,
            },
        }
        controleur.envoie(handler, request)
    }

    const handleCancel = () => {
        controleur?.desincription(handler, listeMessageEmis, listeMessageRecus)
        onCancel()
    }

    const handleAddMember = (userId: string) => {
        if (!controleur || !canal || !teamToEdit) return

        setIsLoading(true)
        setError("")

        const request = {
            team_add_member_request: {
                teamId: teamToEdit.id,
                userId,
            },
        }
        controleur.envoie(handler, request)
    }

    const handleRemoveMember = (userId: string) => {
        if (!controleur || !canal || !teamToEdit) return

        // Ne pas permettre de supprimer le dernier admin
        const isLastAdmin =
            userId === currentUser?.id &&
            teamMembers.filter((member) => member.role === "admin").length ===
                1 &&
            teamMembers.find((member) => member.userId === userId)?.role ===
                "admin"

        if (isLastAdmin) {
            setError(
                "Vous ne pouvez pas quitter l'équipe car vous êtes le seul administrateur"
            )
            return
        }

        setIsLoading(true)
        setError("")

        const request = {
            team_remove_member_request: {
                teamId: teamToEdit.id,
                userId,
            },
        }
        controleur.envoie(handler, request)
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

    const isUserAdmin = teamMembers.some(
        (member) => member.userId === currentUser?.id && member.role === "admin"
    )
    const isCreator = teamToEdit?.createdBy === currentUser?.id
    const canManageMembers = isUserAdmin || isCreator

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <Users size={24} className={styles.icon} />
                    <h2 className={styles.title}>
                        {isEditing
                            ? "Modifier l'équipe"
                            : "Créer une nouvelle équipe"}
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

            {error && (
                <div className={styles.error}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className={styles.success}>{successMessage}</div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="team-name" className={styles.label}>
                        Nom de l'équipe
                    </label>
                    <input
                        id="team-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Marketing, Développement, RH..."
                        className={styles.input}
                        autoFocus
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="team-description" className={styles.label}>
                        Description (optionnelle)
                    </label>
                    <textarea
                        id="team-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez brièvement cette équipe..."
                        className={styles.textarea}
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        {isEditing
                            ? "Membres de l'équipe"
                            : "Ajouter des membres"}
                        {!isEditing && (
                            <span className={styles.requiredField}>*</span>
                        )}
                    </label>

                    {isEditing && canManageMembers && (
                        <div className={styles.membersSection}>
                            <h3 className={styles.sectionTitle}>
                                Membres actuels ({teamMembers.length})
                            </h3>
                            {isLoadingMembers ? (
                                <div className={styles.loading}>
                                    Chargement des membres...
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <div className={styles.emptyState}>
                                    Aucun membre dans cette équipe
                                </div>
                            ) : (
                                <div className={styles.membersList}>
                                    {teamMembers.map((member) => (
                                        <div
                                            key={member.userId}
                                            className={styles.memberItem}
                                        >
                                            <div
                                                className={styles.memberAvatar}
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
                                            <div className={styles.memberInfo}>
                                                <span
                                                    className={
                                                        styles.memberName
                                                    }
                                                >
                                                    {member.firstname}{" "}
                                                    {member.lastname}
                                                    {member.userId ===
                                                        currentUser?.id && (
                                                        <span
                                                            className={
                                                                styles.youBadge
                                                            }
                                                        >
                                                            Vous
                                                        </span>
                                                    )}
                                                </span>
                                                <span
                                                    className={
                                                        styles.memberRole
                                                    }
                                                >
                                                    {member.role === "admin"
                                                        ? "Administrateur"
                                                        : "Membre"}
                                                </span>
                                            </div>
                                            {canManageMembers &&
                                                member.userId !==
                                                    currentUser?.id && (
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.removeButton
                                                        }
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.userId
                                                            )
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.membersSelection}>
                        <div className={styles.searchContainer}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Rechercher des utilisateurs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {!isEditing && selectedMembers.length > 0 && (
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
                                                className={styles.memberAvatar}
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
                                            <div className={styles.memberInfo}>
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
                                                className={styles.removeButton}
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
                                {isEditing
                                    ? "Ajouter des membres"
                                    : "Utilisateurs disponibles"}
                            </h4>
                            {isLoadingUsers ? (
                                <div className={styles.loadingUsers}>
                                    Chargement des utilisateurs...
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className={styles.noResults}>
                                    Aucun utilisateur trouvé
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={styles.userItem}
                                    >
                                        <div className={styles.memberAvatar}>
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
                                                    {user.lastname?.charAt(0) ||
                                                        "?"}
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <span className={styles.memberName}>
                                                {user.firstname} {user.lastname}
                                            </span>
                                        </div>
                                        {isEditing ? (
                                            <button
                                                type="button"
                                                className={styles.addButton}
                                                onClick={() =>
                                                    handleAddMember(user.id)
                                                }
                                                disabled={isLoading}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        ) : (
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
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    {isEditing && canManageMembers && (
                        <>
                            {showDeleteConfirm ? (
                                <div className={styles.deleteConfirm}>
                                    <span>
                                        Êtes-vous sûr de vouloir supprimer cette
                                        équipe ?
                                    </span>
                                    <div className={styles.confirmButtons}>
                                        <button
                                            type="button"
                                            className={
                                                styles.cancelDeleteButton
                                            }
                                            onClick={() =>
                                                setShowDeleteConfirm(false)
                                            }
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            className={
                                                styles.confirmDeleteButton
                                            }
                                            onClick={handleDeleteTeam}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting
                                                ? "Suppression..."
                                                : "Confirmer"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    Supprimer l'équipe
                                </button>
                            )}
                        </>
                    )}
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
                                    ? "Mettre à jour l'équipe"
                                    : "Créer l'équipe"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
