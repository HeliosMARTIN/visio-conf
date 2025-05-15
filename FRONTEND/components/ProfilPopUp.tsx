"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "../types/User";
import styles from "./ProfilPopUp.module.css";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { ChevronRight, Settings, LogOut } from "lucide-react";

export default function ProfilPopUp({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const popUpRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { controleur, currentUser, setCurrentUser } = useAppContext();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [status, setStatus] = useState({
    label: "",
    value: "",
    color: "",
    border: "",
  });

  const verbose = false;
  const nomDInstance = "ProfilPopUp";
  const listeMessageEmis = ["update_user_request"];
  const listeMessageRecus = ["update_user_response"];

  const statusMap = {
    available: { label: "En ligne", color: "#1CE148", border: "" },
    dnd: { label: "Ne pas déranger", color: "#CB0000", border: "" },
    offline: { label: "Invisible", color: "white", border: "#898989 3px solid" },
  };

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

  useEffect(() => {
    if (controleur) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
    }
    return () => {
      if (controleur) {
        controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
      }
    };
  }, [controleur]);

  const hasUpdatedStatusRef = useRef(false);

  useEffect(() => {
    if (!currentUser || hasUpdatedStatusRef.current) return;

    hasUpdatedStatusRef.current = true; // on l'empêche de recommencer

    const payload = {
      update_user_request: {
        id: currentUser.id,
        disturb_status: "available",
      },
    };
    controleur?.envoie(handler, payload);

    setStatus({
      ...statusMap["available"],
      value: "available",
    });
  }, [currentUser]);

  const handler = {
    nomDInstance,
    traitementMessage: (msg: {
      update_user_response?: {
        etat: boolean;
        newUserInfo?: User;
        error?: string;
      };
    }) => {
      if (verbose || controleur?.verboseall) {
        console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);
      }

      if (msg.update_user_response) {
        const { etat, newUserInfo, error } = msg.update_user_response;

        if (!etat) {
          setLoginError("Changement de statut échoué");
        } else if (newUserInfo) {
          setCurrentUser(newUserInfo);
          const mappedStatus =
            statusMap[newUserInfo.status as keyof typeof statusMap];
          if (mappedStatus) {
            setStatus({
              ...mappedStatus,
              value: newUserInfo.status,
            });
          }
        }
      }
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    router.push("/login");
  };

  const handleStatusChange = (
    label: string,
    value: string,
    color: string,
    border: string = ""
  ) => {
    setStatus({ label, value, color, border });
    setLoading(true);
    setError("");

    try {
      const payload = {
        update_user_request: {
          id: currentUser?.id,
          disturb_status: value,
        },
      };
      controleur?.envoie(handler, payload);
    } catch (err) {
      setError("La connexion a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        className={styles.profileButton}
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: "relative" }} // Pour positionner l'indicateur
      >
        <img
          alt="Profile"
          className={styles.profileImage}
          src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser?.picture}`}
        />
        
        {/* Indicateur de statut */}
        <span
          style={{
            backgroundColor: status.color,
            border: status.border || "none",
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            boxSizing: "border-box",
            boxShadow: "0 0 4px rgba(0,0,0,0.2)"
          }}
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
              <p className={styles.names}>
                {currentUser?.firstname} {currentUser?.lastname}
              </p>
              <p className={styles.job}>{currentUser?.job || "Étudiant"}</p>
            </div>
          </div>

          <div
            className={`${styles.shadowBloc} ${styles.status}`}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div className={styles.statusContent}>
              <span
                className={styles.dot}
                style={{ backgroundColor: status.color, border: status.border }}
              />
              <p>{status.label}</p>
            </div>
            <ChevronRight size={21} color="#636363" strokeWidth={3} />

            {isMenuOpen && (
              <div className={styles.menu}>
                <div
                  className={styles.menuItem}
                  onClick={() =>
                    handleStatusChange("En ligne", "available", "#1CE148")
                  }
                >
                  <span
                    className={styles.dot}
                    style={{ backgroundColor: "#1CE148" }}
                  />
                  <span>En ligne</span>
                </div>
                <div
                  className={styles.menuItem}
                  onClick={() =>
                    handleStatusChange("Ne pas déranger", "dnd", "#CB0000")
                  }
                >
                  <span
                    className={styles.dot}
                    style={{ backgroundColor: "#CB0000" }}
                  />
                  <span>Ne pas déranger</span>
                </div>
                <div
                  className={styles.menuItem}
                  onClick={() =>
                    handleStatusChange(
                      "Invisible",
                      "offline",
                      "white",
                      "#898989 3px solid"
                    )
                  }
                >
                  <span
                    className={styles.dot}
                    style={{
                      backgroundColor: "white",
                      border: "#898989 3px solid",
                    }}
                  />
                  <span>Invisible</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.shadowBloc} ${styles.parametres}`}>
            <Settings size={21} />
            <p>Paramètres</p>
          </div>

          <div
            onClick={handleLogout}
            className={`${styles.shadowBloc} ${styles.deconnexion}`}
          >
            <LogOut size={21} />
            <p>Déconnexion</p>
          </div>
        </div>
      )}
    </div>
  );
}

