"use client";
import styles from "./UserInfoMessage.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { User } from "@/types/User";
import { Message } from "@/types/Message";

interface UserInfoProps {
  user: User;
  currentUserEmail: string;
  message?: Message;
  messages?: Message[]; // Ajout d'un tableau de tous les messages
}

export default function UserInfoMessage({
  user,
  currentUserEmail,
  message,
  messages = [], // Valeur par défaut
}: UserInfoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentUser = user.email === currentUserEmail;
  const [pendingMessageCount, setPendingMessageCount] = useState(0);

  // Create a fullName from firstname and lastname
  const fullName = `${user.firstname} ${user.lastname}`;

  // Generate initials from fullName
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Compte les messages en attente de cet utilisateur
  useEffect(() => {
    if (messages && messages.length > 0) {
      const count = messages.filter(
        (msg) =>
          msg.message_sender.email === user.email &&
          msg.message_status === "sent"
      ).length;
      setPendingMessageCount(count);
    }
  }, [messages, user.email]);

  console.log(
    "Pending message count for user:",
    user.email,
    pendingMessageCount
  );

  // Generate a consistent color based on fullName
  const getColorFromName = (name: string) => {
    const colors = [
      "#1E3664", // indigo
      "#0EA5E9", // sky
      "#10B981", // emerald
      "#F59E0B", // amber
      "#EC4899", // pink
      "#8B5CF6", // violet
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromName(fullName);

  return (
    <motion.li
      className={`${styles.userCard} ${
        isCurrentUser ? styles.currentUser : ""
      }`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className={styles.userAvatar}
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
      <div className={styles.userInfo}>
        <h3 className={styles.userName}>{fullName}</h3>
        <div className={styles.userDetails}>
          {message && (
            <div className={styles.messagePreview}>
              <p>{message.message_content}</p>
              <span className={styles.messageTime}>
                {new Date(message.message_date_create).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
      <motion.div
        className={styles.userActions}
        initial={{ opacity: 0, x: 10 }}
        animate={{
          opacity: isHovered ? 1 : pendingMessageCount > 0 ? 1 : 0,
          x: isHovered || pendingMessageCount > 0 ? 0 : 10,
        }}
        transition={{ duration: 0.2 }}
      >
        {isHovered ? (
          <button className={styles.actionButton} aria-label="Message">
            <MessageCircle size={18} />
            <span>Message</span>
          </button>
        ) : pendingMessageCount > 0 ? (
          <div className={styles.pendingBadge}>
            <span>{pendingMessageCount}</span>
          </div>
        ) : null}
      </motion.div>
    </motion.li>
  );
}
