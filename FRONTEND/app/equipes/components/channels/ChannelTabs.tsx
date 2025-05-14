"use client"
import styles from "./ChannelTabs.module.css"
import { HashIcon, Lock, Settings, Plus } from "lucide-react"
import type { Channel } from "@/types/Channel"
import { useAppContext } from "@/context/AppContext"

interface ChannelTabsProps {
    channels: Channel[]
    selectedChannel: Channel | null
    onSelectChannel: (channel: Channel) => void
    onCreateChannel: () => void
    onEditChannel: (channel: Channel) => void
    isAdmin: boolean
}

export default function ChannelTabs({
    channels,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
    onEditChannel,
    isAdmin,
}: ChannelTabsProps) {
    const { currentUser } = useAppContext()

    // Trier les canaux par nom
    const sortedChannels = [...channels].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    return (
        <div className={styles.container}>
            <div className={styles.tabsContainer}>
                {sortedChannels.map((channel) => (
                    <div
                        key={channel.id}
                        className={`${styles.tab} ${
                            selectedChannel?.id === channel.id
                                ? styles.selected
                                : ""
                        }`}
                        onClick={() => onSelectChannel(channel)}
                    >
                        <div className={styles.tabIcon}>
                            {channel.isPublic ? (
                                <HashIcon size={16} />
                            ) : (
                                <Lock size={16} />
                            )}
                        </div>
                        <span className={styles.tabName}>{channel.name}</span>
                    </div>
                ))}
                <button className={styles.addTab} onClick={onCreateChannel}>
                    <Plus size={16} />
                </button>
            </div>
        </div>
    )
}
