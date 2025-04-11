"use client";

import { useAppContext } from "@/context/AppContext";
import styles from "./profilPage.module.css";
import { useState, useRef, useEffect } from "react";
import { ImageDown, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { User } from "@/types/User";

export default function ProfilPage() {
  const { currentUser, controleur, canal, setCurrentUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pathname = usePathname();

  const nomDInstance = "ProfilPage";
  const verbose = false;

  const listeMessageEmis = ["upload_request", "update_user_request"];

  const listeMessageRecus = ["upload_response", "update_user_response"];

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

  const handler = {
    nomDInstance,
    traitementMessage: (msg: {
      upload_response?: {
        etat: boolean;
        error?: string;
        fileName?: string;
        signedUrl?: string;
      };
      update_user_response?: {
        etat: boolean;
        newUserInfo: User | null;
        error?: string;
      };
    }) => {
      if (verbose || controleur?.verboseall)
        console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);

      // ...existing code...

      if (msg.upload_response) {
        if (
          msg.upload_response.etat &&
          pendingFileRef.current &&
          msg.upload_response.signedUrl
        ) {
          // Set mode to "cors" explicitly.
          fetch(msg.upload_response.signedUrl, {
            method: "PUT",
            mode: "cors",
            body: pendingFileRef.current,
            headers: {
              "Content-Type": pendingFileRef.current.type,
            },
          })
            .then((response) => {
              // Considérer les réponses "Slow Down" comme non critiques
              if (
                response.ok ||
                response.status === 503 ||
                response.statusText === "Slow Down"
              ) {
                const updateProfilePictureMessage = {
                  update_user_request: {
                    picture: msg.upload_response?.fileName,
                  },
                };
                controleur.envoie(handler, updateProfilePictureMessage);
                pendingFileRef.current = null;
                setUploadError(null);
              } else {
                setUploadError(
                  "Échec de l'upload sur S3: " + response.statusText
                );
              }
              setIsUploading(false);
            })
            .catch((error) => {
              // Ignorer les erreurs spécifiques liées au throttling
              if (error.message.includes("Slow Down")) {
                const updateProfilePictureMessage = {
                  update_user_request: {
                    picture: msg.upload_response?.fileName,
                  },
                };
                controleur.envoie(handler, updateProfilePictureMessage);
                pendingFileRef.current = null;
                setUploadError(null);
              } else {
                setUploadError("Erreur d'upload sur S3: " + error.message);
              }
              setIsUploading(false);
            });
        } else {
          setUploadError("Échec de l'upload: " + msg.upload_response.error);
          setIsUploading(false);
        }
      }
      if (msg.update_user_response) {
        if (msg.update_user_response.etat) {
          setCurrentUser(msg.update_user_response.newUserInfo);
        } else {
          setUploadError(
            "Échec de la mise à jour du profil: " +
              msg.update_user_response.error
          );
        }
        setIsUploading(false);
      }
    },
  };

  useEffect(() => {
    if (controleur && canal) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
    }
    return () => {
      if (controleur) {
        controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
      }
    };
  }, [pathname, controleur, canal]);

  // Déclencher le clic sur l'input file quand le bouton est cliqué
  const handleEditPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadFile(file);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB threshold

  // Upload du fichier
  const uploadFile = (file: File) => {
    if (!controleur || !currentUser) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        "Le fichier est trop volumineux. Veuillez sélectionner un fichier plus petit."
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // Sauvegarder le fichier dans la ref pour qu'il reste disponible dans le handler
    pendingFileRef.current = file;
    // Réinitialiser l'affichage de l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Envoyer uniquement le nom et le type du fichier; le backend génère une URL signée
    const uploadMessage = {
      upload_request: {
        media: {
          name: file.name,
          fileType: file.type,
        },
      },
    };

    controleur.envoie(handler, uploadMessage);
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
                aria-label="Modifier la photo de profil"
                onClick={handleEditPhotoClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className={styles.spinner} />
                ) : (
                  <ImageDown />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
            </div>

            {uploadError && (
              <p className={styles.errorMessage}>{uploadError}</p>
            )}

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
