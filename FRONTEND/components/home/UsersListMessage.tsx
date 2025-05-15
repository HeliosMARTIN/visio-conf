"use client";
import type { User } from "../../types/User";
import type { Message } from "../../types/Message";
import { UsersListSkeleton } from "../UserSkeleton";
import styles from "./UsersListMessage.module.css";
import UserInfoMessage from "./UserInfoMessage";
import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UsersListProps {
  users: User[];
  currentUserEmail: string;
  isLoading?: boolean;
  messages?: Message[];
}

interface UserWithMessage extends User {
  latestMessage?: Message;
}

export default function UsersListMessage({
  users,
  currentUserEmail,
  isLoading = false,
  messages = [],
}: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserWithMessage[]>([]);

  useEffect(() => {
    const usersWithLatestMessage: UserWithMessage[] = users
      .filter((user) => user.email !== currentUserEmail)
      .map((user) => {
        const userMessages = messages.filter(
          (msg) =>
            msg.message_sender.email === user.email ||
            msg.message_sender.email === currentUserEmail
        );
        const latestMessage = userMessages.sort(
          (a, b) =>
            new Date(b.message_date_create).getTime() -
            new Date(a.message_date_create).getTime()
        )[0];
        return { ...user, latestMessage };
      })
      .filter((user) => user.latestMessage);

    const filtered = usersWithLatestMessage.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.latestMessage?.message_content
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users, currentUserEmail, messages]);

  const getSentMessagesCount = () => {
    return messages.filter((msg) => msg.message_status === "sent").length;
  };

  return (
    <div className={styles.reception}>
      <div className={styles.reception_header}>
        <Bell />
        {getSentMessagesCount() === 0 ? (
          <h3>Vous avez aucune notification</h3>
        ) : (
          <h3>{getSentMessagesCount()} messages en attente</h3>
        )}
      </div>
      <div className={styles.usersListContainer}>
        {getSentMessagesCount() === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.noResults}
          >
            Aucun message trouvé
          </motion.div>
        ) : (
          <>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur ou un message..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoading ? (
              <ul className={styles.usersList}>
                <UsersListSkeleton />
              </ul>
            ) : (
              <div className={styles.usersListWrapper}>
                <AnimatePresence>
                  <ul className={styles.usersList}>
                    {filteredUsers.length > 0 &&
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
                          className={styles.userWithMessageContainer}
                        >
                          <UserInfoMessage
                            user={user}
                            currentUserEmail={currentUserEmail}
                            message={user.latestMessage}
                            messages={messages.filter(
                              (msg) => msg.message_sender.email === user.email
                            )}
                          />
                        </motion.div>
                      ))}
                  </ul>
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
