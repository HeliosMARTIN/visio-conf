"use client"
import { useState, useRef, useEffect } from "react";
import { User } from "../types/User";
import styles from "./ProfilPopUp.module.css";
import { useRouter } from "next/navigation";

export default function ProfilPopUp({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const popUpRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popUpRef.current &&
        !popUpRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        className={styles.profileButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          alt="Profile"
          className={styles.profileImage}
        />
      </button>
      {isOpen && (
        <div ref={popUpRef} className={styles.popUp}>
          <p>{}</p>
          <button >Voir le profil</button>
          <button >Paramètres</button>
          <button>Déconnexion</button>
        </div>
      )}
    </div>
  );
}
