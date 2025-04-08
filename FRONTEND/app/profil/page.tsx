"use client";

import { useAppContext } from "@/context/AppContext";
import styles from "./profilPage.module.css";
import { useState, useRef } from "react";
import { ImageDown } from "lucide-react";

export default function ProfilPage() {
  const { currentUser } = useAppContext();
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result.toString());
          // Ici, vous pourriez ajouter une fonction pour envoyer l'image au serveur
          // uploadProfileImage(e.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Fonction pour formater les dates avec gestion d'erreur
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return "Non disponible";

    try {
      // Convertir en Date si c'est une string
      const dateObj =
        typeof dateValue === "string" ? new Date(dateValue) : dateValue;

      return dateObj.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Format de date invalide";
    }
  };

  console.log("currentUser", currentUser);
  if (!currentUser) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <section className={styles.profilSection}>
            <h1 className={styles.title}>MON PROFIL</h1>
            <div>Chargement en cours...</div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.profilSection}>
          <h1 className={styles.title}>MON PROFIL</h1>
          <div className={styles.profilCard}>
            <div className={styles.photoContainer}>
              <img
                src={
                  currentUser.picture
                    ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser.picture}`
                    : "/default-avatar.png"
                }
                alt="Photo de profil"
                className={styles.profilePhoto}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />
              <button
                className={styles.editPhotoButton}
                onClick={triggerFileInput}
                aria-label="Modifier la photo de profil"
              >
                <ImageDown />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className={styles.fileInput}
              />
            </div>

            <h3>
              {currentUser.firstname || "Prénom"}{" "}
              {currentUser.lastname || "Nom"}
            </h3>
            <p>{currentUser.desc || "Aucune description disponible"}</p>

            <div className={styles.profilItemsContainer}>
              <div className={styles.profilItem}>
                <h4>Nom</h4>
                <p>{currentUser.lastname || "Non renseigné"}</p>
              </div>
              <div className={styles.profilItem}>
                <h4>Prénom</h4>
                <p>{currentUser.firstname || "Non renseigné"}</p>
              </div>
              <div className={styles.profilItem}>
                <h4>Compte créé</h4>
                <p>{formatDate(currentUser.date_create)}</p>
              </div>
              <div className={styles.profilItem}>
                <h4>Dernière connexion</h4>
                <p>{formatDate(currentUser.last_connection)}</p>
              </div>
              <div className={styles.profilItem}>
                <h4>Email</h4>
                <p>{currentUser.email || "Email non renseigné"}</p>
              </div>
              <div className={styles.profilItem}>
                <h4>Rôles</h4>
                <p>
                  {currentUser.roles &&
                  Array.isArray(currentUser.roles) &&
                  currentUser.roles.length > 0
                    ? currentUser.roles.join(", ")
                    : currentUser.roles || "Aucun rôle attribué"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
