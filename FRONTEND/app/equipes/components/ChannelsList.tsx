"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import styles from "./ChannelsList.module.css"
import { Search, Hash, Lock, Settings, MessageSquare } from "lucide-react"
import type { Channel } from "@/types/Channel"
import ChannelSkeleton from "./ChannelSkeleton"

interface ChannelsListProps {
    channels: Channel[]
    isLoading: boolean
    selectedChannel: Channel | null
    onSelectChannel: (channel: Channel) => void
    onEditChannel: (channel: Channel) => void
}

export default function ChannelsList({
    channels,
    isLoading,
    selectedChannel,
    onSelectChannel,
    onEditChannel,
}: ChannelsListProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredChannels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={16} />
                <input
                    type="text"
                    placeholder="Rechercher un canal..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.channelsContainer}>
                {isLoading ? (
                    <ChannelSkeleton count={5} />
                ) : (
                    <AnimatePresence>
                        {filteredChannels.length > 0 ? (
                            <ul className={styles.channelsList}>
                                {filteredChannels.map((channel) => (
                                    <motion.li
                                        key={channel.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className={`${styles.channelItem} ${
                                            selectedChannel?.id === channel.id
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => onSelectChannel(channel)}
                                    >
                                        <div className={styles.channelInfo}>
                                            {channel.isPublic ? (
                                                <Hash
                                                    size={18}
                                                    className={
                                                        styles.channelIcon
                                                    }
                                                />
                                            ) : (
                                                <Lock
                                                    size={18}
                                                    className={
                                                        styles.channelIcon
                                                    }
                                                />
                                            )}
                                            <span
                                                className={styles.channelName}
                                            >
                                                {channel.name}
                                            </span>
                                        </div>
                                        <button
                                            className={styles.settingsButton}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEditChannel(channel)
                                            }}
                                        >
                                            <Settings size={16} />
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.emptyState}>
                                <MessageSquare size={32} />
                                <p>Aucun canal disponible</p>
                                <p className={styles.emptyStateSubtext}>
                                    Créez un nouveau canal pour commencer à
                                    discuter
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
