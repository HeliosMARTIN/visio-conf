"use client"

import React, { useState, useEffect } from "react"
import { useAppContext } from "@/context/AppContext"
import { X, CirclePlus, Send } from "lucide-react"
import { User } from "@/types/User"

interface CreateDiscussionProps {
    onDiscussionCreated: () => void
    searchResults: User[]
    controleur: any
    handler: any
}

export const CreateDiscussion: React.FC<CreateDiscussionProps> = ({
    onDiscussionCreated,
    searchResults,
    controleur,
    handler,
}) => {
    const [isCreating, setIsCreating] = useState(false)
    const { currentUser } = useAppContext()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const filteredSearchResults = searchResults.filter((user) => {
        // Compatibilité avec les deux types d'ID
        const currentUserId = currentUser?.id || currentUser?.userId
        const userId = user.id || user.userId

        const isCurrentUser = userId === currentUserId
        const isAlreadySelected = selectedUsers.some(
            (selectedUser) =>
                (selectedUser.id && selectedUser.id === userId) ||
                (selectedUser.userId && selectedUser.userId === userId)
        )

        return !isCurrentUser && !isAlreadySelected
    })

    const searchUsers = (query: string) => {
        if (!query.trim() || !controleur) return
        const message = {
            users_search_request: query,
        }
        controleur.envoie(handler, message)
    }

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (searchQuery.length >= 1) {
                searchUsers(searchQuery)
            }
        }, 300)
        return () => clearTimeout(debounceTimeout)
    }, [searchQuery])

    const handleUserSelect = (user: User) => {
        setSelectedUsers([...selectedUsers, user])
        setSearchQuery("")
    }

    const removeSelectedUser = (userId: string) => {
        setSelectedUsers(
            selectedUsers.filter(
                (user) => user.id !== userId && user.userId !== userId
            )
        )
    }

    const handleCreateDiscussion = async () => {
        if (!currentUser || selectedUsers.length === 0 || !message.trim()) {
            setError(
                "Veuillez sélectionner au moins un utilisateur et écrire un message"
            )
            return
        }

        try {
            setIsCreating(true)

            // Compatibilité avec les deux types d'ID
            const currentUserId = currentUser.id || currentUser.userId

            const otherUserIds = selectedUsers.map(
                (user) => user.id || user.userId
            )

            const message_request = {
                message_send_request: {
                    userEmail: currentUserId,
                    otherUserEmail: otherUserIds,
                    text: message,
                    discussion_creator: currentUserId,
                    discussion_uuid: crypto.randomUUID(),
                    message_content: message,
                    message_uuid: crypto.randomUUID(),
                    message_date_create: new Date().toISOString(),
                },
            }

            controleur.envoie(handler, message_request)

            setMessage("")
            setSelectedUsers([])
        } catch (error) {
            setError("Erreur lors de la création de la discussion")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="create-discussion">
            <div className="search-users">
                <div className="selected-users">
                    {selectedUsers.map((user) => (
                        <div
                            key={user.id || user.userId}
                            className="selected-user-chip"
                        >
                            <span>{`${user.firstname} ${user.lastname}`}</span>
                            <X
                                size={16}
                                onClick={() =>
                                    removeSelectedUser(
                                        user.id || user.userId || ""
                                    )
                                }
                                className="remove-user"
                            />
                        </div>
                    ))}
                </div>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des utilisateurs..."
                    className="search-input"
                />
            </div>

            {filteredSearchResults.length > 0 && searchQuery && (
                <div className="search-results">
                    <h4>Résultats pertinents :</h4>
                    {filteredSearchResults.map((user) => (
                        <div
                            key={user.id || user.userId}
                            onClick={() => handleUserSelect(user)}
                            className="search-result-item"
                        >
                            <div className="user-info">
                                <img
                                    src={
                                        user.picture ||
                                        "/images/default_profile_picture.png"
                                    }
                                    alt=""
                                    className="user-avatar"
                                />
                                <span>{`${user.firstname} ${user.lastname}`}</span>
                            </div>
                            <CirclePlus size={16} className="add-user" />
                        </div>
                    ))}
                </div>
            )}

            <div className="message-input-container">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="message-input"
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
                onClick={handleCreateDiscussion}
                disabled={
                    isCreating || selectedUsers.length === 0 || !message.trim()
                }
                className="create-button"
            >
                {isCreating ? (
                    "Création..."
                ) : (
                    <>
                        <span>Créer et envoyer</span>
                        <Send size={16} />
                    </>
                )}
            </button>
        </div>
    )
}
