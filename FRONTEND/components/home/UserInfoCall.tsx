"use client";
import styles from "./UserInfoCall.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { User } from "@/types/User";
import { Call } from "@/types/Call";
import { useRouter } from "next/navigation";

interface UserInfoCallProps {
  user: User;
  currentUserEmail: string;
  call?: Call;
  calls?: Call[]; // Ajout d'un tableau de tous les appels
}

export default function UserInfoCall({
  user,
  currentUserEmail,
  call,
  calls = [], // Valeur par défaut
}: UserInfoCallProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentUser = user.email === currentUserEmail;
  const [missedCallCount, setMissedCallCount] = useState(0);

  // Create a fullName from firstname and lastname
  const fullName = `${user.firstname} ${user.lastname}`;

  // Generate initials from fullName
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Compte les appels manqués de cet utilisateur
  useEffect(() => {
    if (calls && calls.length > 0) {
      const count = calls.filter(
        (c) => c.call_sender.email === user.email && c.call_type === "missed"
      ).length;
      setMissedCallCount(count);
    }
  }, [calls, user.email]);

  // Fonction pour gérer le clic sur l'utilisateur
  const handleUserClick = () => {
    // Rediriger vers la page de discussion avec cet utilisateur
    router.push(`/discussion`);
  };

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

  // Fonction pour obtenir l'icône correspondant au type d'appel
  const getCallIcon = (callType: string, isOutgoing: boolean) => {
    if (callType === "missed") {
      return <PhoneMissed className={styles.missedCall} size={16} />;
    } else if (isOutgoing) {
      return <PhoneOutgoing className={styles.outgoingCall} size={16} />;
    } else {
      return <PhoneIncoming className={styles.incomingCall} size={16} />;
    }
  };

  const avatarColor = getColorFromName(fullName);

  return (
    <motion.li
      onClick={handleUserClick}
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
          {call && (
            <div className={styles.callPreview}>
              <div className={styles.callType}>
                {getCallIcon(
                  call.call_type,
                  call.call_sender.email === currentUserEmail
                )}
              </div>
              <span className={styles.callTime}>
                {new Date(call.call_date_create).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );
}
