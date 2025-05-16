"use client"

import { useState, useEffect } from "react"
import styles from "./page.module.css"
import TeamsList from "./components/teams/TeamsList"
import ChannelView from "./components/channels/ChannelView"
import ChannelForm from "./components/channels/ChannelForm"
import TeamForm from "./components/teams/TeamForm"
import ChannelTabs from "./components/channels/ChannelTabs"
import type { Channel } from "@/types/Channel"
import type { Team } from "@/types/Team"
import { useAppContext } from "@/context/AppContext"

export default function EquipesPage() {
    const { controleur, canal, currentUser } = useAppContext()
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [channels, setChannels] = useState<Channel[]>([])
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
    const [showChannelForm, setShowChannelForm] = useState(false)
    const [showTeamForm, setShowTeamForm] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(true)
    const [isLoadingChannels, setIsLoadingChannels] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null)
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)

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
                    setChannels(msg.channels_list_response.channels || [])
                    setIsLoadingChannels(false)

                    // Si aucun canal n'est sélectionné et qu'il y a des canaux, sélectionner le premier
                    if (
                        !selectedChannel &&
                        msg.channels_list_response.channels &&
                        msg.channels_list_response.channels.length > 0
                    ) {
                        setSelectedChannel(
                            msg.channels_list_response.channels[0]
                        )
                    }
                } else {
                    console.error(
                        "Erreur lors de la récupération des canaux:",
                        msg.channels_list_response.error
                    )
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
        setSelectedChannel(null)
        setShowChannelForm(false)
        setShowTeamForm(false)
        loadTeamChannels(team.id)
    }

    const handleChannelSelect = (channel: Channel) => {
        setSelectedChannel(channel)
        setShowChannelForm(false)
        setShowTeamForm(false)
    }

    const handleCreateTeam = () => {
        setTeamToEdit(null)
        setShowTeamForm(true)
        setShowChannelForm(false)
    }

    const handleEditTeam = (team: Team) => {
        setTeamToEdit(team)
        setShowTeamForm(true)
        setShowChannelForm(false)
    }

    const handleManageTeamMembers = (team: Team) => {
        setTeamToEdit(team)
        setShowTeamForm(true)
        setShowChannelForm(false)
    }

    const handleCreateChannel = () => {
        setChannelToEdit(null)
        setShowChannelForm(true)
        setShowTeamForm(false)
    }

    const handleEditChannel = (channel: Channel) => {
        setChannelToEdit(channel)
        setShowChannelForm(true)
        setShowTeamForm(false)
    }

    const handleTeamCreated = (newTeam: Team) => {
        // Si l'équipe a été supprimée
        if (newTeam.deleted) {
            // Recharger la liste des équipes
            const teamsRequest = { teams_list_request: {} }
            controleur?.envoie(handler, teamsRequest)

            // Réinitialiser la sélection
            setSelectedTeam(null)
            setSelectedChannel(null)
            setShowTeamForm(false)
            return
        }

        // Recharger la liste des équipes
        const teamsRequest = { teams_list_request: {} }
        controleur?.envoie(handler, teamsRequest)

        setSelectedTeam(newTeam)
        setShowTeamForm(false)
        loadTeamChannels(newTeam.id)
    }

    const handleChannelCreated = (newChannel: Channel) => {
        if (channelToEdit) {
            // Mise à jour d'un canal existant
            setChannels((prevChannels) =>
                prevChannels.map((c) =>
                    c.id === newChannel.id ? newChannel : c
                )
            )
            setChannelToEdit(null)
        } else {
            // Nouveau canal créé
            setChannels((prevChannels) => [...prevChannels, newChannel])
        }
        setSelectedChannel(newChannel)
        setShowChannelForm(false)
    }

    const handleCancelTeamForm = () => {
        setShowTeamForm(false)
        setTeamToEdit(null)
    }

    const handleCancelChannelForm = () => {
        setShowChannelForm(false)
        setChannelToEdit(null)
    }

    const isTeamAdmin = selectedTeam?.role === "admin" || isAdmin

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <TeamsList
                    teams={teams}
                    selectedTeam={selectedTeam}
                    onSelectTeam={handleTeamSelect}
                    onCreateTeam={handleCreateTeam}
                    onEditTeam={handleEditTeam}
                    onManageMembers={handleManageTeamMembers}
                    isLoading={isLoadingTeams}
                />
            </div>

            <div className={styles.content}>
                {showTeamForm ? (
                    <TeamForm
                        onTeamCreated={handleTeamCreated}
                        onCancel={handleCancelTeamForm}
                        teamToEdit={teamToEdit}
                    />
                ) : showChannelForm && selectedTeam ? (
                    <ChannelForm
                        onChannelCreated={handleChannelCreated}
                        onCancel={handleCancelChannelForm}
                        channelToEdit={channelToEdit}
                        team={selectedTeam}
                    />
                ) : selectedTeam ? (
                    <div className={styles.teamContent}>
                        <ChannelTabs
                            channels={channels}
                            selectedChannel={selectedChannel}
                            onSelectChannel={handleChannelSelect}
                            onCreateChannel={handleCreateChannel}
                            onEditChannel={handleEditChannel}
                            isAdmin={isTeamAdmin}
                        />

                        {selectedChannel ? (
                            <ChannelView
                                channel={selectedChannel}
                                userId={currentUser?.id || ""}
                                onEditChannel={
                                    isTeamAdmin
                                        ? () =>
                                              handleEditChannel(selectedChannel)
                                        : undefined
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
                            onClick={handleCreateTeam}
                        >
                            Créer une équipe
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
