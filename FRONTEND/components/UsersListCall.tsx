"use client";
import type { User } from "../types/User";
import UserInfo from "./UserInfo";
import { UsersListSkeleton } from "./UserSkeleton";
import styles from "./UsersListCall.module.css";
import { useState, useEffect } from "react";
import {
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Call } from "@/types/Call";

interface UsersListCallProps {
  users: User[];
  currentUserEmail: string;
  isLoading?: boolean;
  calls?: Call[];
  limitCalls?: number;
}

interface UserWithCall extends User {
  latestCall?: Call;
}

export default function UsersListCall({
  users,
  currentUserEmail,
  isLoading = false,
  calls = [],
  limitCalls = 5, // Limite par défaut à 5 appels
}: UsersListCallProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserWithCall[]>([]);

  useEffect(() => {
    // Trier les appels par date (les plus récents d'abord)
    const sortedCalls = [...calls].sort(
      (a, b) =>
        new Date(b.call_date).getTime() - new Date(a.call_date).getTime()
    );

    // Prendre seulement les 5 (ou limitCalls) plus récents
    const recentCalls = sortedCalls.slice(0, limitCalls);

    // Associer chaque appel à l'utilisateur correspondant
    const latestCallsByUser = new Map<string, Call>();

    recentCalls.forEach((call) => {
      // Trouver l'autre participant (pas l'utilisateur courant)
      const otherParticipant = call.participants.find(
        (participant) => participant.email !== currentUserEmail
      );

      if (otherParticipant) {
        if (
          !latestCallsByUser.has(otherParticipant.email) ||
          new Date(call.call_date) >
            new Date(latestCallsByUser.get(otherParticipant.email)!.call_date)
        ) {
          latestCallsByUser.set(otherParticipant.email, call);
        }
      }
    });

    // Créer une liste d'utilisateurs avec leurs derniers appels
    const usersWithCalls: UserWithCall[] = users
      .filter(
        (user) =>
          user.email !== currentUserEmail && latestCallsByUser.has(user.email)
      )
      .map((user) => ({
        ...user,
        latestCall: latestCallsByUser.get(user.email),
      }));

    // Filtrer en fonction du terme de recherche
    if (searchTerm.trim() === "") {
      setFilteredUsers(usersWithCalls);
    } else {
      const filtered = usersWithCalls.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users, currentUserEmail, calls, limitCalls]);

  // Fonction pour formater la durée de l'appel
  const formatCallDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Fonction pour obtenir l'icône correspondant au type d'appel
  const getCallIcon = (callType: string) => {
    switch (callType) {
      case "incoming":
        return <PhoneIncoming className={styles.incomingCall} size={16} />;
      case "outgoing":
        return <PhoneOutgoing className={styles.outgoingCall} size={16} />;
      case "missed":
        return <PhoneMissed className={styles.missedCall} size={16} />;
      default:
        return <PhoneIncoming className={styles.incomingCall} size={16} />;
    }
  };

  return (
    <div className={styles.usersListContainer}>
      {calls.length > 0 && (
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {isLoading ? (
        <ul className={styles.usersList}>
          <UsersListSkeleton />
        </ul>
      ) : (
        <>
          <div className={styles.usersListWrapper}>
            <AnimatePresence>
              <ul className={styles.usersList}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      className={styles.userWithCallContainer}
                    >
                      <UserInfo
                        user={user}
                        currentUserEmail={currentUserEmail}
                      />
                      {user.latestCall && (
                        <div className={styles.callInfo}>
                          <div className={styles.callType}>
                            {getCallIcon(user.latestCall.call_type)}
                          </div>
                          <span className={styles.callTime}>
                            {new Date(
                              user.latestCall.call_date
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                          {user.latestCall.call_duration > 0 &&
                            user.latestCall.call_type !== "missed" && (
                              <span className={styles.callDuration}>
                                ·{" "}
                                {formatCallDuration(
                                  user.latestCall.call_duration
                                )}
                              </span>
                            )}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.noResults}
                  >
                    Aucun appel récent
                  </motion.div>
                )}
              </ul>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
