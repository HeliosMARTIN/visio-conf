"use client";
import { User } from "../types/User";
import styles from "./UserInfo.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface UserInfoProps {
  user: User;
  currentUserEmail: string;
  variant?: "default" | "home-message" | "home-call";
}

export default function UserInfo({
  user,
  currentUserEmail,
  variant = "default",
}: UserInfoProps) {
  const router = useRouter();

  const handleMessage = () => {
    console.log("user", user);
    router.push(`/message?id=${user.id}`);
  };
  const handleCall = () => {
    console.log("user", user);
    router.push(`/call?id=${user.id}`);
  };

  if (user.email === currentUserEmail) return null;

  if (variant === "home-message") {
    return (
      <div
        className={styles.reception_body_item}
        onClick={handleMessage}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.reception_body_item_content}>
          <Image
            src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
            alt={`${user.firstname} profile picture`}
            width={50}
            height={50}
            unoptimized
            className={styles.userImage}
          />
          <div>
            <h3>
              {user.firstname} {user.lastname}
            </h3>
            <p>Exemple message reçu</p>
          </div>
        </div>
        <ChevronRight />
      </div>
    );
  }

  if (variant === "home-call") {
    return (
      <div
        className={styles.reception_body_item}
        onClick={handleCall}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.reception_body_item_content}>
          <Image
            src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
            alt={`${user.firstname} profile picture`}
            width={50}
            height={50}
            unoptimized
            className={styles.userImage}
          />
          <div>
            <h3>
              {user.firstname} {user.lastname}
            </h3>
            <p>Durée call</p>
          </div>
        </div>
        <p>Date call</p>
      </div>
    );
  }

  return (
    <li className={styles.userInfo}>
      <div
        className={styles.userInfoContent}
        onClick={handleMessage}
        style={{ cursor: "pointer" }}
      >
        <Image
          src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
          alt={`${user.firstname} profile picture`}
          width={50}
          height={50}
          unoptimized
          className={styles.userImage}
        />
        <div className={styles.userDetails}>
          <span>
            {user.firstname} {user.lastname}
          </span>
          <span className={styles.userEmail}>({user.email})</span>
        </div>
      </div>
      <button className={styles.messageButton} onClick={handleMessage}>
        Envoyer un message
      </button>
    </li>
  );
}
