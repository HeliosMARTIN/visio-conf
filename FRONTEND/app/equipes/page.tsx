"use client"
import { useEffect, useState } from "react"
import styles from "./page.module.css"
import { useAppContext } from "@/context/AppContext"
import { motion } from "framer-motion"
import { Users, Plus, ArrowLeft, MessageSquare } from "lucide-react"
import ChannelsList from "./components/ChannelsList"
import ChannelView from "./components/ChannelView"
import ChannelForm from "./components/ChannelForm"
import type { Channel } from "@/types/Channel"

export default function EquipesPage() {
    const { controleur, canal, currentUser } = useAppContext()

    const nomDInstance = "EquipesPage"
    const verbose = false

    const listeMessageEmis = ["channels_list_request"]
    const listeMessageRecus = ["channels_list_response"]

    const [channels, setChannels] = useState<Channel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
    const [showChannelForm, setShowChannelForm] = useState(false)
    const [formMode, setFormMode] = useState<"create" | "edit">("create")

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.channels_list_response) {
                setIsLoading(false)
                if (!msg.channels_list_response.etat) {
                    console.log(
                        `Récupération des canaux échouée: ${msg.channels_list_response.error}`
                    )
                } else {
                    setChannels(msg.channels_list_response.channels || [])
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal && currentUser) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
            fetchChannelsList()
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
    }, [currentUser])

    const fetchChannelsList = () => {
        setIsLoading(true)
        const T = { channels_list_request: {} }
        controleur?.envoie(handler, T)
    }

    const handleChannelSelect = (channel: Channel) => {
        setSelectedChannel(channel)
        setShowChannelForm(false)
    }

    const handleCreateChannel = () => {
        setSelectedChannel(null)
        setFormMode("create")
        setShowChannelForm(true)
    }

    const handleEditChannel = (channel: Channel) => {
        setSelectedChannel(channel)
        setFormMode("edit")
        setShowChannelForm(true)
    }

    const handleFormClose = () => {
        setShowChannelForm(false)
        fetchChannelsList()
    }

    const handleBackToChannels = () => {
        setSelectedChannel(null)
        setShowChannelForm(false)
    }

    return (
        <div className={styles.page}>
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className={styles.titleContainer}>
                    <Users className={styles.icon} />
                    <h1 className={styles.title}>Équipes</h1>
                </div>
                <p className={styles.subtitle}>
                    Gérez et rejoignez des canaux de communication
                </p>
            </motion.div>

            <motion.main
                className={styles.main}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2 className={styles.sidebarTitle}>Canaux</h2>
                        <button
                            className={styles.addButton}
                            onClick={handleCreateChannel}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <ChannelsList
                        channels={channels}
                        isLoading={isLoading}
                        selectedChannel={selectedChannel}
                        onSelectChannel={handleChannelSelect}
                        onEditChannel={handleEditChannel}
                    />
                </div>

                <div className={styles.content}>
                    {showChannelForm ? (
                        <>
                            <div
                                className={styles.backButton}
                                onClick={handleBackToChannels}
                            >
                                <ArrowLeft size={16} />
                                <span>Retourner aux canaux</span>
                            </div>
                            <ChannelForm
                                mode={formMode}
                                channel={
                                    formMode === "edit" ? selectedChannel : null
                                }
                                onClose={handleFormClose}
                            />
                        </>
                    ) : selectedChannel ? (
                        <ChannelView
                            channel={selectedChannel}
                            onEditChannel={() =>
                                handleEditChannel(selectedChannel)
                            }
                        />
                    ) : (
                        <div className={styles.emptyState}>
                            <MessageSquare size={48} />
                            <h3 className={styles.emptyStateTitle}>
                                Aucun canal sélectionné
                            </h3>
                            <p className={styles.emptyStateDescription}>
                                Sélectionnez un canal existant ou créez-en un
                                nouveau pour commencer à discuter
                            </p>
                        </div>
                    )}
                </div>
            </motion.main>
        </div>
    )
}
