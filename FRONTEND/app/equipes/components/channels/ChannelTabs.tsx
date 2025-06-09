"use client"
import { useRef, useEffect, useState } from "react"
import styles from "./ChannelTabs.module.css"
import { HashIcon, Lock, Plus } from "lucide-react"
import type { Channel } from "@/types/Channel"
import { useAppContext } from "@/context/AppContext"

interface ChannelTabsProps {
    channels: Channel[]
    selectedChannel: Channel | null
    onSelectChannel: (channel: Channel) => void
    onCreateChannel: () => void
    onChannelDeleted?: (deletedChannelId: string) => void
}

export default function ChannelTabs({
    channels,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
    onChannelDeleted,
}: ChannelTabsProps) {
    const tabsContainerRef = useRef<HTMLDivElement>(null)
    const [showLeftNav, setShowLeftNav] = useState(false)
    const [showRightNav, setShowRightNav] = useState(false)

    // Trier les canaux par nom
    const sortedChannels = [...channels].sort((a, b) =>
        a.name.localeCompare(b.name)
    )

    // Faire défiler jusqu'au canal sélectionné
    useEffect(() => {
        if (selectedChannel && tabsContainerRef.current) {
            const selectedTab = tabsContainerRef.current.querySelector(
                `[data-channel-id="${selectedChannel.id}"]`
            ) as HTMLElement
            if (selectedTab) {
                const containerRect =
                    tabsContainerRef.current.getBoundingClientRect()
                const tabRect = selectedTab.getBoundingClientRect()

                if (
                    tabRect.left < containerRect.left ||
                    tabRect.right > containerRect.right
                ) {
                    selectedTab.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest",
                    })
                }
            }
        }
    }, [selectedChannel])

    return (
        <div className={styles.container}>
            <div className={styles.tabsContainer} ref={tabsContainerRef}>
                {sortedChannels.map((channel) => (
                    <div
                        key={channel.id}
                        data-channel-id={channel.id}
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
            </div>
            <div className={styles.tabsAddWrapper}>
                <button className={styles.addTab} onClick={onCreateChannel}>
                    <Plus size={16} />
                </button>
            </div>
        </div>
    )
}
