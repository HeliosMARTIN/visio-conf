"use client";

import styles from "./UserListAmis.module.css";
import { User } from "@/types/User";

interface UserListAmisProps {
  users: User[];
  currentUserEmail: string;
}

export default function UserListAmis({
  users,
  currentUserEmail,
}: UserListAmisProps) {
  return (
    <div className={styles.amis_list_scroll}>
      {users
        .filter((user) => user.email !== currentUserEmail)
        .map((user) => (
          <a href="/discussion" key={user.id}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                <img
                  src={
                    user.picture
                      ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`
                      : "/images/default_profile_picture.png"
                  }
                  alt={`${user.firstname} ${user.lastname}`}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className={styles.userInfo}>
                <div
                  className={styles.userName}
                >{`${user.firstname} ${user.lastname}`}</div>
                <div className={styles.userDetails}>
                  <span className={styles.userEmail}>{user.email}</span>
                  {user.phone && (
                    <span className={styles.userPhone}>{user.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
    </div>
  );
}
