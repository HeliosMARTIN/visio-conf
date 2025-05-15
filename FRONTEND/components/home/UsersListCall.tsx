"use client";
import type { User } from "../../types/User";
import { UsersListSkeleton } from "../UserSkeleton";
import styles from "./UsersListCall.module.css";
import { useState, useEffect } from "react";
import {
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Call } from "@/types/Call";
import UserInfoCall from "./UserInfoCall";

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
  limitCalls = 5,
}: UsersListCallProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserWithCall[]>([]);

  useEffect(() => {
    const sortedCalls = [...calls].sort(
      (a, b) =>
        new Date(b.call_date_create).getTime() -
        new Date(a.call_date_create).getTime()
    );
    const recentCalls = sortedCalls.slice(0, limitCalls);

    const latestCallsByUser = new Map<string, Call>();
    recentCalls.forEach((call) => {
      if (call.call_recipient.email === currentUserEmail) {
        const otherParticipant = call.call_sender;
        if (
          !latestCallsByUser.has(otherParticipant.email) ||
          new Date(call.call_date_create) >
            new Date(
              latestCallsByUser.get(otherParticipant.email)!.call_date_create
            )
        ) {
          latestCallsByUser.set(otherParticipant.email, call);
        }
      } else if (call.call_sender.email === currentUserEmail) {
        const otherParticipant = call.call_recipient;
        if (
          !latestCallsByUser.has(otherParticipant.email) ||
          new Date(call.call_date_create) >
            new Date(
              latestCallsByUser.get(otherParticipant.email)!.call_date_create
            )
        ) {
          latestCallsByUser.set(otherParticipant.email, call);
        }
      }
    });

    const usersWithCalls: UserWithCall[] = users
      .filter(
        (user) =>
          user.email !== currentUserEmail && latestCallsByUser.has(user.email)
      )
      .map((user) => ({
        ...user,
        latestCall: latestCallsByUser.get(user.email),
      }));

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

  const formatCallDuration = (call: Call): string => {
    const startDate = new Date(call.call_date_create);
    const endDate = new Date(call.call_date_end);
    const durationSeconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000
    );
    if (durationSeconds < 60) {
      return `${durationSeconds}s`;
    }
    const minutes = Math.floor(durationSeconds / 60);
    const remainingSeconds = durationSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCallIcon = (callType: string, isOutgoing: boolean) => {
    if (callType === "missed") {
      return <PhoneMissed className={styles.missedCall} size={16} />;
    } else if (isOutgoing) {
      return <PhoneOutgoing className={styles.outgoingCall} size={16} />;
    } else {
      return <PhoneIncoming className={styles.incomingCall} size={16} />;
    }
  };

  const getMissedCallsCount = () => {
    const uniqueCallers = new Set<string>();
    calls
      .filter((call) => call.call_type === "missed")
      .forEach((call) => {
        uniqueCallers.add(call.call_sender.email);
      });
    return uniqueCallers.size;
  };

  return (
    <div className={styles.reception}>
      <div className={styles.reception_header}>
        <Clock />
        {getMissedCallsCount() === 0 ? (
          <h3>Aucun appel manqué</h3>
        ) : (
          <h3>{getMissedCallsCount()} appels manqués</h3>
        )}
      </div>
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
                      <UserInfoCall
                        user={user}
                        currentUserEmail={currentUserEmail}
                      />
                      {user.latestCall && (
                        <div className={styles.callInfo}>
                          <div className={styles.callType}>
                            {getCallIcon(
                              user.latestCall.call_type,
                              user.latestCall.call_sender.email ===
                                currentUserEmail
                            )}
                          </div>
                          <span className={styles.callTime}>
                            {new Date(
                              user.latestCall.call_date_create
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                          {user.latestCall.call_type !== "missed" && (
                            <span className={styles.callDuration}>
                              · {formatCallDuration(user.latestCall)}
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
        )}
      </div>
    </div>
  );
}
