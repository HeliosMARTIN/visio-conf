"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { motion } from "framer-motion"
import type { FileItem as FileItemType } from "../../../types/File"
import styles from "./FileItem.module.css"
import {
    File,
    Folder,
    ImageIcon,
    FileText,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    Video,
    Music,
    MoreVertical,
    Download,
    Trash2,
    Edit,
    Share2,
    Move,
} from "lucide-react"
import { formatFileSize, formatDate, getLink } from "../../../utils/fileHelpers"
import { useAppContext } from "@/context/AppContext"

interface FileItemProps {
    file: FileItemType
    viewMode: "grid" | "list"
    onOpen: (file: FileItemType) => void
    onDelete: (file: FileItemType) => void
    onRename: (file: FileItemType) => void
    onMove: (file: FileItemType) => void
    onShare: (file: FileItemType) => void
}

export default function FileItem({
    file,
    viewMode,
    onOpen,
    onDelete,
    onRename,
    onMove,
    onShare,
}: FileItemProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const { currentUser } = useAppContext()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false)
            }
        }

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showMenu])

    const downloadFile = async (file: FileItemType) => {
        if (!currentUser) {
            console.error(
                "No current user available to generate the file link."
            )
            return
        }

        try {
            const response = await fetch(getLink(currentUser, file.name))
            if (!response.ok) {
                throw new Error("Failed to fetch the file")
            }
            const blob = await response.blob()
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = file.name // Set the file name for download
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href) // Clean up the object URL
        } catch (error) {
            console.error("Error downloading the file:", error)
        }
    }

    const getFileIcon = () => {
        if (file.type === "folder")
            return <Folder size={viewMode === "grid" ? 40 : 24} />

        const mimeType = file.mimeType || ""
        const extension = file.extension?.toLowerCase() || ""

        if (mimeType.startsWith("image/"))
            return <ImageIcon size={viewMode === "grid" ? 40 : 24} />
        if (mimeType.startsWith("video/"))
            return <Video size={viewMode === "grid" ? 40 : 24} />
        if (mimeType.startsWith("audio/"))
            return <Music size={viewMode === "grid" ? 40 : 24} />

        if (["pdf"].includes(extension))
            return <FileText size={viewMode === "grid" ? 40 : 24} />
        if (["doc", "docx", "txt", "rtf"].includes(extension))
            return <FileText size={viewMode === "grid" ? 40 : 24} />
        if (["xls", "xlsx", "csv"].includes(extension))
            return <FileSpreadsheet size={viewMode === "grid" ? 40 : 24} />
        if (["zip", "rar", "tar", "gz"].includes(extension))
            return <FileArchive size={viewMode === "grid" ? 40 : 24} />
        if (
            ["js", "ts", "html", "css", "py", "java", "php"].includes(extension)
        )
            return <FileCode size={viewMode === "grid" ? 40 : 24} />

        return <File size={viewMode === "grid" ? 40 : 24} />
    }

    const getIconColor = () => {
        if (file.type === "folder") return "#1E3664"

        const extension = file.extension?.toLowerCase() || ""
        const mimeType = file.mimeType || ""

        if (mimeType.startsWith("image/")) return "#EC4899"
        if (mimeType.startsWith("video/")) return "#F59E0B"
        if (mimeType.startsWith("audio/")) return "#8B5CF6"

        if (["pdf"].includes(extension)) return "#EF4444"
        if (["doc", "docx", "txt", "rtf"].includes(extension)) return "#3B82F6"
        if (["xls", "xlsx", "csv"].includes(extension)) return "#10B981"
        if (["zip", "rar", "tar", "gz"].includes(extension)) return "#6B7280"
        if (
            ["js", "ts", "html", "css", "py", "java", "php"].includes(extension)
        )
            return "#F59E0B"

        return "#6B7280"
    }

    // Card animation variants
    const cardVariants = {
        initial: {
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            backgroundColor: "rgba(249, 250, 251, 1)",
        },
        hover: {
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(249, 250, 251, 1)",
        },
    }

    // Icon animation variants
    const iconVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 300 } },
    }

    const handleClick = () => {
        // Prevent file item click if the menu is open
        if (showMenu) return

        // Ne déclenche onOpen que si c'est un dossier ou une image avec une miniature
        if (
            file.type === "folder" ||
            (file.type === "file" && file.mimeType?.startsWith("image/"))
        ) {
            onOpen(file)
        } else if (file.type === "file") {
            downloadFile(file)
        }
    }

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering the file item's onClick
        setShowMenu(!showMenu)
    }

    const handleActionClick = (e: React.MouseEvent, action: string) => {
        e.stopPropagation() // Prevent triggering the file item's onClick
        setShowMenu(false)

        switch (action) {
            case "delete":
                onDelete(file)
                break
            case "rename":
                onRename(file)
                break
            case "move":
                onMove(file)
                break
            case "share":
                onShare(file)
                break
            case "download":
                if (file.type === "file") downloadFile(file)
                break
        }
    }

    const shouldShowThumbnail =
        file.type === "file" && file.mimeType?.startsWith("image/")

    return (
        <motion.div
            className={`${styles.fileItem} ${styles[viewMode]}`}
            variants={cardVariants}
            initial="initial"
            animate={isHovered && !showMenu ? "hover" : "initial"} // Disable hover animation if menu is open
            onClick={!showMenu ? handleClick : undefined} // Disable click if menu is open
            onHoverStart={() => !showMenu && setIsHovered(true)} // Disable hover start if menu is open
            onHoverEnd={() => {
                setIsHovered(false)
                if (!showMenu) setShowMenu(false)
            }}
            whileTap={!showMenu ? { scale: 0.98 } : undefined} // Disable tap animation if menu is open
        >
            <motion.div
                className={styles.iconContainer}
                variants={iconVariants}
                style={{ color: getIconColor() }}
            >
                {shouldShowThumbnail ? (
                    <img
                        src={
                            `https://visioconfbucket.s3.eu-north-1.amazonaws.com/files/${currentUser?.id}/${file.name}` ||
                            "/placeholder.svg"
                        }
                        alt={file.name}
                        className={styles.thumbnail}
                    />
                ) : (
                    getFileIcon()
                )}
            </motion.div>

            <div className={styles.fileDetails}>
                <motion.div
                    className={styles.fileName}
                    animate={{
                        color: isHovered ? "#1E3664" : "#1f2937",
                    }}
                >
                    {file.name}
                </motion.div>

                {viewMode === "list" && (
                    <>
                        <div className={styles.fileDate}>
                            {formatDate(file.updatedAt)}
                        </div>
                        {file.type === "file" && file.size && (
                            <div className={styles.fileSize}>
                                {formatFileSize(file.size)}
                            </div>
                        )}
                    </>
                )}
            </div>

            <motion.div
                className={styles.fileActions}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered || showMenu ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <button
                    className={styles.menuButton}
                    onClick={handleMenuClick}
                    aria-label="Plus d'options"
                >
                    <MoreVertical size={18} />
                </button>

                {showMenu && (
                    <motion.div
                        ref={menuRef}
                        className={styles.menuDropdown}
                        style={{ zIndex: 1000 }} // Ensure higher z-index
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button
                            className={styles.menuItem}
                            onClick={(e) => handleActionClick(e, "rename")}
                        >
                            <Edit size={16} />
                            <span>Renommer</span>
                        </button>

                        {file.type === "file" && (
                            <button
                                className={styles.menuItem}
                                onClick={(e) =>
                                    handleActionClick(e, "download")
                                }
                            >
                                <Download size={16} />
                                <span>Télécharger</span>
                            </button>
                        )}

                        <button
                            className={styles.menuItem}
                            onClick={(e) => handleActionClick(e, "move")}
                        >
                            <Move size={16} />
                            <span>Déplacer</span>
                        </button>

                        <button
                            className={styles.menuItem}
                            onClick={(e) => handleActionClick(e, "share")}
                        >
                            <Share2 size={16} />
                            <span>Partager</span>
                        </button>

                        <button
                            className={`${styles.menuItem} ${styles.deleteItem}`}
                            onClick={(e) => handleActionClick(e, "delete")}
                        >
                            <Trash2 size={16} />
                            <span>Supprimer</span>
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}
