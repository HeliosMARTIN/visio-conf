"use client"

import { useAppContext } from "@/context/AppContext"
import styles from "./profilPage.module.css"
import { useState, useRef, useEffect } from "react"
import { ImageDown, Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"
import { User } from "@/types/User"
import { getProfilePictureUrl, getApiUrl } from "@/utils/fileHelpers"

export default function ProfilPage() {
    const { currentUser, controleur, canal, setCurrentUser } = useAppContext()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const pathname = usePathname()

    const nomDInstance = "ProfilPage"
    const verbose = false

    const listeMessageEmis = ["update_user_request"]

    const listeMessageRecus = ["update_user_response"]

    // Fonction pour formater les dates avec gestion d'erreur
    const formatDate = (dateValue: string | Date | undefined) => {
        if (!dateValue) return "Non disponible"

        try {
            // Convertir en Date si c'est une string
            const dateObj =
                typeof dateValue === "string" ? new Date(dateValue) : dateValue

            return dateObj.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Format de date invalide"
        }
    }

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            update_user_response?: {
                etat: boolean
                newUserInfo: User | null
                error?: string
            }
        }) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )

            if (msg.update_user_response) {
                if (msg.update_user_response.etat) {
                    setCurrentUser(msg.update_user_response.newUserInfo)
                    setUploadError(null)
                } else {
                    setUploadError(
                        "Échec de la mise à jour du profil: " +
                            msg.update_user_response.error
                    )
                }
                setIsUploading(false)
            }
        },
    }

    useEffect(() => {
        if (controleur && canal && currentUser?.id) {
            // Log pour debug
            if (verbose)
                console.log(
                    "Inscription aux messages avec l'utilisateur:",
                    currentUser.id
                )

            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        } else {
            // Log pour debug
            if (verbose)
                console.log("Impossible de s'inscrire aux messages:", {
                    controleur: !!controleur,
                    canal: !!canal,
                    userId: currentUser?.id,
                })
        }

        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [pathname, controleur, canal, currentUser])

    useEffect(() => {
        // Réinitialisation complète lorsque l'utilisateur change
        setSelectedFile(null)
        setIsUploading(false)
        setUploadError(null)

        // Désinscription et réinscription
        if (controleur) {
            controleur.desincription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            )

            if (canal && currentUser?.id) {
                controleur.inscription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
                if (verbose)
                    console.log(
                        "Réinscription pour le nouvel utilisateur:",
                        currentUser.id
                    )
            }
        }
    }, [currentUser?.id]) // Dépendance spécifique à l'ID utilisateur

    // Déclencher le clic sur l'input file quand le bouton est cliqué
    const handleEditPhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    // Gérer le changement de fichier
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            uploadFile(file)
        }
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB threshold    // Upload du fichier avec le système local
    const uploadFile = async (file: File) => {
        if (!currentUser) {
            setUploadError("Utilisateur non connecté")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setUploadError(
                "Le fichier est trop volumineux. Veuillez sélectionner un fichier plus petit."
            )
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            // Créer FormData pour l'upload
            const formData = new FormData()
            formData.append("profilePicture", file)

            // Envoyer le fichier au serveur local
            const response = await fetch("/api/files/upload/profile", {
                method: "POST",
                body: formData,
                credentials: "include", // Pour inclure les cookies d'authentification
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                // Mettre à jour le profil utilisateur avec le nouveau nom de fichier
                const updateProfilePictureMessage = {
                    update_user_request: {
                        id: currentUser.id,
                        picture: result.filename,
                    },
                }

                if (controleur) {
                    controleur.envoie(handler, updateProfilePictureMessage)
                }
            } else {
                setUploadError(result.error || "Erreur lors de l'upload")
                setIsUploading(false)
            }
        } catch (error) {
            console.error("Erreur upload:", error)
            setUploadError("Erreur lors de l'upload du fichier")
            setIsUploading(false)
        }

        // Réinitialiser l'input file
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

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
        )
    }

    // Ajout : filtrer les rôles valides
    const filteredRoles =
        currentUser.roles && Array.isArray(currentUser.roles)
            ? currentUser.roles.filter((role) => !!role && role !== "")
            : []

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.profilSection}>
                    <h1 className={styles.title}>MON PROFIL</h1>
                    <div className={styles.profilCard}>
                        <div className={styles.photoContainer}>
                            {" "}
                            <img
                                src={getProfilePictureUrl(currentUser.picture)}
                                alt="Photo de profil"
                                className={styles.profilePhoto}
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).src =
                                        getProfilePictureUrl()
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
                        )}{" "}
                        <h3>
                            {currentUser.firstname || "Prénom"}{" "}
                            {currentUser.lastname || "Nom"}
                        </h3>
                        <p>
                            {currentUser.desc ||
                                "Aucune description disponible"}
                        </p>
                        <div className={styles.profilItemsContainer}>
                            <div className={styles.profilItem}>
                                <h4>Nom</h4>
                                <p>{currentUser.lastname || "Non renseigné"}</p>
                            </div>
                            <div className={styles.profilItem}>
                                <h4>Prénom</h4>
                                <p>
                                    {currentUser.firstname || "Non renseigné"}
                                </p>
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
                                <p>
                                    {currentUser.email || "Email non renseigné"}
                                </p>
                            </div>
                            <div className={styles.profilItem}>
                                <h4>Rôles</h4>
                                <p>
                                    {currentUser.roles &&
                                    Array.isArray(currentUser.roles) &&
                                    filteredRoles.length > 0
                                        ? filteredRoles.join(", ")
                                        : "Aucun rôle attribué"}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
