"use client"
import { useState, useRef, useEffect } from "react";
import { User } from "../types/User";
import styles from "./ProfilPopUp.module.css";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext"
import CurrentUser from "../components/CurrentUser"


export default function ProfilPopUp({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const popUpRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { controleur, canal, currentUser, setCurrentUser } = useAppContext()

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
          src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser?.picture}`}
        />
      </button>
      {isOpen && (
        <div ref={popUpRef} className={styles.popUp}>
            <div className={styles.infosProfil}>
              <img 
                className={styles.photoProfil}
                src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser?.picture}`}
                alt="profile" 
              />
              <div>
                  <p>{currentUser?.firstname} {currentUser?.lastname}</p>
                  <p>{currentUser?.job}</p>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
