"use client"
import { useState, useEffect } from "react"
import styles from "./ChannelsList.module.css"
import { HashIcon, Lock, Search } from "lucide-react"
import ChannelSkeleton from "./ChannelSkeleton"
import type { Channel } from "@/types/Channel"
import { useAppContext } from "@/context/AppContext"

interface ChannelsListProps {
  channels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
  isLoading: boolean
}

export default function ChannelsList({ channels, selectedChannel, onSelectChannel, isLoading }: ChannelsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { currentUser } = useAppContext()
  const [userChannelMemberships, setUserChannelMemberships] = useState<Record<string, boolean>>({})

  // Déterminer les canaux dont l'utilisateur est membre
  useEffect(() => {
    const memberships: Record<string, boolean> = {}

    channels.forEach((channel) => {
      const isMember =
        channel.members?.some((member) => member.userId === currentUser?._id) || channel.isMember || false

      memberships[channel._id] = isMember
    })

    setUserChannelMemberships(memberships)
  }, [channels, currentUser])

  // Filtrer les canaux à afficher (publics ou privés dont l'utilisateur est membre)
  const filteredChannels = channels.filter((channel) => {
    const nameMatch = channel.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (channel.isPublic) {
      return nameMatch // Tous les canaux publics sont affichés
    } else {
      // Les canaux privés sont affichés uniquement si l'utilisateur en est membre
      return nameMatch && (channel.isMember || userChannelMemberships[channel._id])
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un canal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.channelsList}>
        {isLoading ? (
          <>
            <ChannelSkeleton />
            <ChannelSkeleton />
            <ChannelSkeleton />
          </>
        ) : filteredChannels.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aucun canal trouvé</p>
          </div>
        ) : (
          <>
            {filteredChannels.map((channel) => {
              const channelId = channel._id
              const isMember = channel.isMember || userChannelMemberships[channelId]

              return (
                <div
                  key={channelId}
                  className={`${styles.channelItem} ${selectedChannel?.id === channelId ? styles.selected : ""} ${
                    isMember ? styles.joinedChannel : styles.availableChannel
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className={styles.channelIcon}>
                    {channel.isPublic ? <HashIcon size={18} /> : <Lock size={18} />}
                  </div>
                  <div className={styles.channelInfo}>
                    <span className={styles.channelName}>{channel.name}</span>
                    {!isMember && channel.isPublic && <span className={styles.joinStatus}>Disponible</span>}
                  </div>
                  {/* Optionnel: ajouter un badge avec le nombre de membres */}
                  {channel.members && channel.members.length > 0 && (
                    <div className={styles.channelBadge} title={`${channel.members.length} membres`}>
                      {channel.members.length}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
