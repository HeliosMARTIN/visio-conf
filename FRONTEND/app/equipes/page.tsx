"use client"

import { useState, useEffect } from "react"
import styles from "./page.module.css"
import TeamsList from "./components/teams/TeamsList"
import ChannelView from "./components/channels/ChannelView"
import ChannelForm from "./components/channels/ChannelForm"
import TeamForm from "./components/teams/TeamForm"
import ChannelTabs from "./components/channels/ChannelTabs"
import { useChannelManager } from "./hooks/useChannelManager"
import type { Team } from "@/types/Team"
import { useAppContext } from "@/context/AppContext"

export default function EquipesPage() {
    const { controleur, canal, currentUser } = useAppContext()
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [showTeamForm, setShowTeamForm] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(true)
    const [isLoadingChannels, setIsLoadingChannels] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)

    // Use the channel manager hook
    const {
        channels,
        selectedChannel,
        showChannelForm,
        channelToEdit,
        handleChannelSelect,
        handleCreateChannel,
        handleEditChannel,
        handleChannelCreated,
        handleChannelDeleted,
        handleCancelChannelForm,
        updateChannelsFromResponse,
    } = useChannelManager({
        initialChannels: [],
        onChannelsChange: (newChannels) => {
            // Optional: Handle channels change if needed
            console.log("Channels updated:", newChannels.length)
        },
    })

    const nomDInstance = "EquipesPage"
    const verbose = false

    const listeMessageEmis = [
        "teams_list_request",
        "channels_list_request",
        "channel_members_request",
    ]
    const listeMessageRecus = [
        "teams_list_response",
        "channels_list_response",
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

            if (msg.teams_list_response) {
                if (msg.teams_list_response.etat) {
                    setTeams(msg.teams_list_response.teams || [])
                    setIsLoadingTeams(false)

                    // Si aucune équipe n'est sélectionnée et qu'il y a des équipes, sélectionner la première équipe où l'utilisateur est membre
                    if (
                        !selectedTeam &&
                        msg.teams_list_response.teams &&
                        msg.teams_list_response.teams.length > 0
                    ) {
                        const memberTeams =
                            msg.teams_list_response.teams.filter(
                                (team: any) => team.role
                            )

                        if (memberTeams.length > 0) {
                            const firstTeam = memberTeams[0]
                            setSelectedTeam(firstTeam)
                            loadTeamChannels(firstTeam.id)
                        }
                    }
                } else {
                    console.error(
                        "Erreur lors de la récupération des équipes:",
                        msg.teams_list_response.error
                    )
                }
            }

            if (msg.channels_list_response) {
                if (msg.channels_list_response.etat) {
                    const channelsFromResponse =
                        msg.channels_list_response.channels || []
                    updateChannelsFromResponse(channelsFromResponse)
                    setIsLoadingChannels(false)
                } else {
                    console.error(
                        "Erreur lors de la récupération des canaux:",
                        msg.channels_list_response.error
                    )
                    setIsLoadingChannels(false)
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal && currentUser) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            // Récupérer la liste des équipes
            const teamsRequest = { teams_list_request: {} }
            controleur.envoie(handler, teamsRequest)

            setIsAdmin(currentUser.roles?.includes("Administrateur") || false)
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
    }, [controleur, canal, currentUser])

    const loadTeamChannels = (teamId: string) => {
        if (controleur && canal) {
            setIsLoadingChannels(true)
            const channelsRequest = { channels_list_request: { teamId } }
            controleur.envoie(handler, channelsRequest)
        }
    }

    const handleTeamSelect = (team: Team) => {
        // Vérifier si l'utilisateur est membre de l'équipe
        if (!team.role) {
            // Si l'utilisateur n'est pas membre, lui montrer un message
            alert(
                "Vous n'êtes pas membre de cette équipe. Contactez un administrateur pour y être ajouté."
            )
            return
        }

        setSelectedTeam(team)
        setShowTeamForm(false)
        loadTeamChannels(team.id)
    }

    const handleTeamCreated = (newTeam: Team) => {
        // Si l'équipe a été supprimée
        if (newTeam.deleted) {
            // Recharger la liste des équipes
            const teamsRequest = { teams_list_request: {} }
            controleur?.envoie(handler, teamsRequest)

            // Réinitialiser la sélection
            setSelectedTeam(null)
            setShowTeamForm(false)
            return
        }

        // Recharger la liste des équipes
        const teamsRequest = { teams_list_request: {} }
        controleur?.envoie(handler, teamsRequest)

        // Sélectionner automatiquement la nouvelle équipe
        setSelectedTeam(newTeam)
        setShowTeamForm(false)
        loadTeamChannels(newTeam.id)
    }

    const handleCancelTeamForm = () => {
        setShowTeamForm(false)
        setTeamToEdit(null)
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <TeamsList
                    teams={teams}
                    selectedTeam={selectedTeam}
                    onSelectTeam={handleTeamSelect}
                    onCreateTeam={() => {
                        setTeamToEdit(null)
                        setShowTeamForm(true)
                    }}
                    onEditTeam={(team) => {
                        setTeamToEdit(team)
                        setShowTeamForm(true)
                    }}
                    onManageMembers={(team) => {
                        setTeamToEdit(team)
                        setShowTeamForm(true)
                    }}
                    isLoading={isLoadingTeams}
                />
            </div>

            <div className={styles.content}>
                {showTeamForm ? (
                    <div className={styles.formOverlay}>
                        <TeamForm
                            onTeamCreated={handleTeamCreated}
                            onCancel={handleCancelTeamForm}
                            teamToEdit={teamToEdit}
                        />
                    </div>
                ) : showChannelForm && selectedTeam ? (
                    <div className={styles.formOverlay}>
                        <ChannelForm
                            onChannelCreated={handleChannelCreated}
                            onCancel={handleCancelChannelForm}
                            channelToEdit={channelToEdit}
                            team={selectedTeam}
                        />
                    </div>
                ) : selectedTeam ? (
                    <div className={styles.teamContent}>
                        <ChannelTabs
                            channels={channels}
                            selectedChannel={selectedChannel}
                            onSelectChannel={handleChannelSelect}
                            onCreateChannel={handleCreateChannel}
                            onChannelDeleted={handleChannelDeleted}
                        />

                        {selectedChannel ? (
                            <ChannelView
                                channel={selectedChannel}
                                userId={currentUser?.id || ""}
                                onEditChannel={() => handleEditChannel()}
                                onChannelDeleted={() =>
                                    selectedChannel.id &&
                                    handleChannelDeleted(selectedChannel.id)
                                }
                            />
                        ) : (
                            <div className={styles.emptyChannelState}>
                                <h3>Sélectionnez un canal</h3>
                                <p>
                                    Choisissez un canal dans la liste ci-dessus
                                    ou créez-en un nouveau
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <h2>Bienvenue dans les équipes</h2>
                        <p>
                            Sélectionnez une équipe ou créez-en une nouvelle
                            pour commencer
                        </p>
                        <button
                            className={styles.createTeamButton}
                            onClick={() => {
                                setTeamToEdit(null)
                                setShowTeamForm(true)
                            }}
                        >
                            Créer une équipe
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
