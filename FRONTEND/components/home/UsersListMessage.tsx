"use client";
import type { User } from "../../types/User";
import type { Message } from "../../types/Message";
import { UsersListSkeleton } from "../UserSkeleton";
import styles from "./UsersListMessage.module.css";
import UserInfoMessage from "./UserInfoMessage";
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
  const [sentMessages, setSentMessages] = useState<UserWithMessage[]>([]);
  const [readMessages, setReadMessages] = useState<UserWithMessage[]>([]);
  const [showNotificationsOnly, setShowNotificationsOnly] = useState(true);

  useEffect(() => {
    const userConversations = new Map<string, Message[]>();

    messages.forEach((msg) => {
      const otherUserEmail =
        msg.message_sender.email !== currentUserEmail
          ? msg.message_sender.email
          : null;

      if (otherUserEmail) {
        if (!userConversations.has(otherUserEmail)) {
          userConversations.set(otherUserEmail, []);
        }
        userConversations.get(otherUserEmail)?.push(msg);
      }
    });

    const sentMessagesByUser = new Map<string, Message>();
    const readMessagesByUser = new Map<string, Message>();

    userConversations.forEach((messages, userEmail) => {
      // Sort messages by date (newest first)
      const sortedMessages = [...messages].sort(
        (a, b) =>
          new Date(b.message_date_create).getTime() -
          new Date(a.message_date_create).getTime()
      );

      // Find the latest sent message
      const latestSentMessage = sortedMessages.find(
        (msg) => msg.message_status === "sent"
      );
      if (latestSentMessage) {
        sentMessagesByUser.set(userEmail, latestSentMessage);
      }

      // Find the latest read messages (up to 5)
      const latestReadMessages = sortedMessages
        .filter((msg) => msg.message_status === "read")
        .slice(0, 5);

      if (latestReadMessages.length > 0) {
        readMessagesByUser.set(userEmail, latestReadMessages[0]);
      }
    });

    // Create users with sent messages
    let usersWithSentMessages: UserWithMessage[] = users
      .filter(
        (user) =>
          user.email !== currentUserEmail && sentMessagesByUser.has(user.email)
      )
      .map((user) => ({
        ...user,
        latestMessage: sentMessagesByUser.get(user.email),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.latestMessage?.message_date_create || 0);
        const dateB = new Date(b.latestMessage?.message_date_create || 0);
        return dateB.getTime() - dateA.getTime();
      });

    // Create users with read messages (limited to 5)
    let usersWithReadMessages: UserWithMessage[] = users
      .filter(
        (user) =>
          user.email !== currentUserEmail && readMessagesByUser.has(user.email)
      )
      .map((user) => ({
        ...user,
        latestMessage: readMessagesByUser.get(user.email),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.latestMessage?.message_date_create || 0);
        const dateB = new Date(b.latestMessage?.message_date_create || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    setSentMessages(usersWithSentMessages);
    setReadMessages(usersWithReadMessages);

    // Apply search filter if needed
    if (searchTerm.trim() === "") {
      // Default display - show sent messages if any, otherwise show read messages
      setFilteredUsers(
        usersWithSentMessages.length > 0
          ? usersWithSentMessages
          : usersWithReadMessages
      );
    } else {
      // Combine both lists for searching
      const allMessages = [...usersWithSentMessages, ...usersWithReadMessages];
      const filtered = allMessages.filter((user) => {
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

  // Count sent messages (notifications)
  const sentMessagesCount = sentMessages.length;

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
                      <UserInfoMessage
                        user={user}
                        currentUserEmail={currentUserEmail}
                        message={user.latestMessage}
                        messages={messages.filter(
                          (msg) => msg.message_sender.email === user.email
                        )} // Seulement les messages de cet utilisateur
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.noResults}
                  >
                    {sentMessagesCount === 0 && messages.length === 0
                      ? "Aucune conversation récente"
                      : "Aucun message en attente trouvé"}
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
