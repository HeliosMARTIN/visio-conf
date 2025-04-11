"use client";
import type { User } from "../types/User";
import type { Message } from "../types/Message";
import UserInfo from "./UserInfo";
import { UsersListSkeleton } from "./UserSkeleton";
import styles from "./UsersListMessage.module.css";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
    const deliveredMessages = messages.filter(
      (msg) => msg.message_status === "delivered"
    );

    const latestMessagesByUser = new Map<string, Message>();

    deliveredMessages.forEach((msg) => {
      const senderEmail = msg.message_sender.email;

      if (
        !latestMessagesByUser.has(senderEmail) ||
        new Date(msg.message_date_create) >
          new Date(latestMessagesByUser.get(senderEmail)!.message_date_create)
      ) {
        latestMessagesByUser.set(senderEmail, msg);
      }
    });

    const usersWithMessages: UserWithMessage[] = users
      .filter(
        (user) =>
          user.email !== currentUserEmail &&
          latestMessagesByUser.has(user.email)
      )
      .map((user) => ({
        ...user,
        latestMessage: latestMessagesByUser.get(user.email),
      }));

    if (searchTerm.trim() === "") {
      setFilteredUsers(usersWithMessages);
    } else {
      const filtered = usersWithMessages.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.latestMessage?.message_content
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users, currentUserEmail, messages]);

  console.log("messages:", messages);
  return (
    <div className={styles.usersListContainer}>
      {messages.length == 0 ? null : (
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
                      className={styles.userWithMessageContainer}
                    >
                      <UserInfo
                        user={user}
                        currentUserEmail={currentUserEmail}
                      />
                      {user.latestMessage && (
                        <div className={styles.messagePreview}>
                          <p>{user.latestMessage.message_content}</p>
                          <span className={styles.messageTime}>
                            {new Date(
                              user.latestMessage.message_date_create
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
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
                    Aucun message en attente trouvé
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
