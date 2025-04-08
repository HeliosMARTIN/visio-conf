"use client"
import { useState, useRef, useEffect } from "react";
import { User } from "../types/User";
import styles from "./ProfilPopUp.module.css";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import {ChevronRight,Settings, LogOut} from "lucide-react";
import CurrentUser from "../components/CurrentUser"


export default function ProfilPopUp({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const popUpRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { controleur, canal, currentUser, setCurrentUser } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [status, setStatus] = useState({ label: 'En ligne', color: '#1CE148', border: "" });

  useEffect(() => {
    console.log(currentUser);
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

  const handleLogout = () => {
        localStorage.removeItem("token")
        setCurrentUser(null)
        router.push("/login")
    }

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
              <div className={styles.infos}>
                  <p className={styles.names}>{currentUser?.firstname} {currentUser?.lastname}</p>
                  <p className={styles.job}>{currentUser?.job}Etudiant</p>
              </div>
            </div>
            <div
              className={`${styles.shadowBloc} ${styles.status}`}
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <div className={styles.statusContent}>
                <span className={styles.dot} style={{ backgroundColor: status.color, border: status.border }} />
                <p>{status.label}</p>
              </div>

              <ChevronRight size={21} color="#636363" strokeWidth={3}/>

              {isMenuOpen && (
                <div className={styles.menu}>
                  <div className={styles.menuItem} onClick={() => setStatus({ label: 'En ligne', color: '#1CE148', border:"" })}>
                    <span className={styles.dot} style={{ backgroundColor: '#1CE148' }} />
                    <span>En ligne</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => setStatus({ label: 'Ne pas déranger', color: '#CB0000', border:"" })}>
                    <span className={styles.dot} style={{ backgroundColor: '#CB0000' }} />
                    <span>Ne pas déranger</span>
                  </div>
                  <div className={styles.menuItem} onClick={() => setStatus({ label: 'Invisible', color: 'white',border: '#898989 3px solid', })}>
                    <span className={styles.dot} style={{ backgroundColor: 'white', border: '#898989 3px solid', }} />
                    <span>Invisible</span>
                  </div>
                </div>
              )}
            </div>
            <div className={`${styles.shadowBloc} ${styles.parametres}`}>
              <Settings size={21}/>
              <p>Parametres</p>
            </div>
            <div onClick={handleLogout} className={`${styles.shadowBloc} ${styles.deconnexion}`}>
              <LogOut size={21} />
              <p>Deconnexion</p>
            </div>
        </div>
      )}
    </div>
  );
}
