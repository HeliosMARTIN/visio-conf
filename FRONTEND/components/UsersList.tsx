"use client";
import { User } from "../types/User";
import UserInfo from "./UserInfo";
import styles from "./UsersList.module.css";

interface UsersListProps {
  users: User[];
  currentUserEmail: string;
  variant?: "default" | "home-message" | "home-call";
  className?: string;
}

export default function UsersList({
  users,
  currentUserEmail,
  variant = "default",
  className = "",
}: UsersListProps) {
  if (variant === "home-message") {
    return (
      <div className={className || styles.usersList}>
        {users.length > 0 ? (
          users.map((user, index) => (
            <UserInfo
              key={index}
              user={user}
              currentUserEmail={currentUserEmail}
              variant="home-message"
            />
          ))
        ) : (
          <div className={styles.reception_body_item}>
            <p>Aucun autre utilisateur disponible</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === "home-call") {
    return (
      <div className={className || styles.usersList}>
        {users.length > 0 ? (
          users.map((user, index) => (
            <UserInfo
              key={index}
              user={user}
              currentUserEmail={currentUserEmail}
              variant="home-call"
            />
          ))
        ) : (
          <div className={styles.reception_body_item}>
            <p>Aucun autre utilisateur disponible</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ul className={className || styles.usersList}>
      {users.map((user, index) => (
        <UserInfo key={index} user={user} currentUserEmail={currentUserEmail} />
      ))}
    </ul>
  );
}
