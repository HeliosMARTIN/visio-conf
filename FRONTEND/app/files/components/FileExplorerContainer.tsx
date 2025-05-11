"use client"
import { useEffect, useState, useRef } from "react"
import { useAppContext } from "@/context/AppContext"
import FileExplorer from "./FileExplorer"
import type { FileItem } from "../../../types/File"
import {
    getFileExtension,
    getMimeTypeFromExtension,
} from "../../../utils/fileHelpers"
import styles from "../page.module.css"

export default function FileExplorerContainer() {
    const { controleur, canal, currentUser } = useAppContext()

    const nomDInstance = "FilesPage"
    const verbose = false

    const listeMessageEmis = [
        "files_list_request",
        "folders_list_request",
        "file_upload_request",
        "file_delete_request",
        "file_rename_request",
        "file_move_request",
        "file_share_request",
        "folder_create_request",
        "file_download_request",
    ]

    const listeMessageRecus = [
        "files_list_response",
        "folders_list_response",
        "file_upload_response",
        "file_delete_response",
        "file_rename_response",
        "file_move_response",
        "file_share_response",
        "folder_create_response",
        "file_download_response",
    ]

    const [files, setFiles] = useState<FileItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPath, setCurrentPath] = useState<string[]>([])
    const [error, setError] = useState("")
    const pendingFileRef = useRef<File | null>(null)
    const isInitialMount = useRef(true)

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose || controleur?.verboseall) {
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            }

            // Handle files list response
            if (msg.files_list_response) {
                setIsLoading(false)
                if (!msg.files_list_response.etat) {
                    setError(
                        `Échec de la récupération des fichiers: ${msg.files_list_response.error}`
                    )
                } else {
                    setFiles(msg.files_list_response.files || [])
                }
            }

            // Handle file upload response
            if (msg.file_upload_response) {
                if (
                    msg.file_upload_response.etat &&
                    pendingFileRef.current &&
                    msg.file_upload_response.signedUrl
                ) {
                    // Upload the file to the signed URL
                    fetch(msg.file_upload_response.signedUrl, {
                        method: "PUT",
                        mode: "cors",
                        body: pendingFileRef.current,
                        headers: {
                            "Content-Type": pendingFileRef.current.type,
                        },
                    })
                        .then((response) => {
                            if (response.ok) {
                                // Refresh the file list
                                fetchFilesList(
                                    currentPath[currentPath.length - 1]
                                )
                                pendingFileRef.current = null
                            } else {
                                setError(
                                    "Échec du téléversement: " +
                                        response.statusText
                                )
                            }
                        })
                        .catch((error) => {
                            setError(
                                "Erreur de téléversement: " + error.message
                            )
                        })
                } else if (!msg.file_upload_response.etat) {
                    setError(
                        "Échec du téléversement: " +
                            msg.file_upload_response.error
                    )
                }
            }

            // Handle file delete response
            if (msg.file_delete_response) {
                if (msg.file_delete_response.etat) {
                    // Refresh the file list
                    fetchFilesList(currentPath[currentPath.length - 1])
                } else {
                    setError(
                        "Échec de la suppression: " +
                            msg.file_delete_response.error
                    )
                }
            }

            // Handle file rename response
            if (msg.file_rename_response) {
                if (msg.file_rename_response.etat) {
                    // Refresh the file list
                    fetchFilesList(currentPath[currentPath.length - 1])
                } else {
                    setError(
                        "Échec du renommage: " + msg.file_rename_response.error
                    )
                }
            }

            // Handle file move response
            if (msg.file_move_response) {
                if (msg.file_move_response.etat) {
                    // Refresh the file list
                    fetchFilesList(currentPath[currentPath.length - 1])
                } else {
                    setError(
                        "Échec du déplacement: " + msg.file_move_response.error
                    )
                }
            }

            // Handle file share response
            if (msg.file_share_response) {
                if (msg.file_share_response.etat) {
                    // Refresh the file list
                    fetchFilesList(currentPath[currentPath.length - 1])
                } else {
                    setError(
                        "Échec du partage: " + msg.file_share_response.error
                    )
                }
            }

            // Handle folder create response
            if (msg.folder_create_response) {
                if (msg.folder_create_response.etat) {
                    // Refresh the file list
                    fetchFilesList(currentPath[currentPath.length - 1])
                } else {
                    setError(
                        "Échec de la création du dossier: " +
                            msg.folder_create_response.error
                    )
                }
            }

            // Handle file download response
            if (msg.file_download_response) {
                setIsLoading(false)
                if (
                    msg.file_download_response.etat &&
                    msg.file_download_response.downloadUrl
                ) {
                    // Open the download URL in a new tab
                    window.open(
                        msg.file_download_response.downloadUrl,
                        "_blank"
                    )
                } else {
                    setError(
                        "Échec du téléchargement: " +
                            (msg.file_download_response.error ||
                                "Erreur inconnue")
                    )
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)

            // Only fetch files on initial mount to prevent redundant calls
            if (isInitialMount.current) {
                setTimeout(() => {
                    fetchFilesList(currentPath[currentPath.length - 1])
                }, 1000) // Wait 1 second before the first fetch to await for user current info to be fetched by app context
                isInitialMount.current = false
            }
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
    }, [controleur, canal])

    const fetchFilesList = (folderId?: string) => {
        setIsLoading(true)
        try {
            const T = {
                files_list_request: {
                    folderId,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError(
                "Échec de la récupération des fichiers. Veuillez réessayer."
            )
            setIsLoading(false)
        }
    }

    const handleCreateFolder = (name: string) => {
        try {
            const T = {
                folder_create_request: {
                    name,
                    parentId:
                        currentPath.length > 0
                            ? currentPath[currentPath.length - 1]
                            : undefined,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec de la création du dossier. Veuillez réessayer.")
        }
    }

    const handleUploadFile = (file: File) => {
        try {
            // Save file to ref so it remains available in the handler
            pendingFileRef.current = file

            const extension = getFileExtension(file.name)
            const mimeType = file.type || getMimeTypeFromExtension(extension)

            const T = {
                file_upload_request: {
                    userId: currentUser?.id,
                    name: file.name,
                    size: file.size,
                    mimeType,
                    extension,
                    parentId:
                        currentPath.length > 0
                            ? currentPath[currentPath.length - 1]
                            : undefined,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec du téléversement du fichier. Veuillez réessayer.")
        }
    }

    const handleDeleteFile = (fileId: string) => {
        try {
            const T = {
                file_delete_request: {
                    fileId,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec de la suppression du fichier. Veuillez réessayer.")
        }
    }

    const handleRenameFile = (fileId: string, newName: string) => {
        try {
            const T = {
                file_rename_request: {
                    fileId,
                    newName,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec du renommage du fichier. Veuillez réessayer.")
        }
    }

    const handleMoveFile = (fileId: string, newParentId: string) => {
        try {
            const T = {
                file_move_request: {
                    fileId,
                    newParentId,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec du déplacement du fichier. Veuillez réessayer.")
        }
    }

    const handleShareFile = (fileId: string, isPublic: boolean) => {
        try {
            const T = {
                file_share_request: {
                    fileId,
                    isPublic,
                },
            }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Échec du partage du fichier. Veuillez réessayer.")
        }
    }

    const handleNavigate = (folderId?: string) => {
        if (folderId) {
            // Navigate to folder
            setCurrentPath((prev) => {
                if (prev.includes(folderId)) {
                    // If we're navigating to a folder that's already in the path,
                    // truncate the path up to that folder
                    const index = prev.indexOf(folderId)
                    return prev.slice(0, index + 1)
                } else {
                    // Otherwise, add the folder to the path
                    return [...prev, folderId]
                }
            })
        } else {
            // Navigate to root
            setCurrentPath([])
        }

        fetchFilesList(folderId)
    }

    return (
        <>
            {error && (
                <div className={styles.error}>
                    {error}
                    <button
                        className={styles.dismissButton}
                        onClick={() => setError("")}
                    >
                        Fermer
                    </button>
                </div>
            )}

            <FileExplorer
                files={files}
                currentPath={currentPath}
                isLoading={isLoading}
                onFetchFiles={fetchFilesList}
                onCreateFolder={handleCreateFolder}
                onUploadFile={handleUploadFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onMoveFile={handleMoveFile}
                onShareFile={handleShareFile}
                onNavigate={handleNavigate}
            />
        </>
    )
}
