"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import type { FileItem as FileItemType } from "../../types/File"
import styles from "./FileItem.module.css"
import {
  File,
  Folder,
  Image,
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
import { formatFileSize, formatDate } from "../../utils/fileHelpers"

interface FileItemProps {
  file: FileItemType
  viewMode: "grid" | "list"
  onOpen: (file: FileItemType) => void
  onDelete: (file: FileItemType) => void
  onRename: (file: FileItemType) => void
  onMove: (file: FileItemType) => void
  onShare: (file: FileItemType) => void
  onDownload?: (file: FileItemType) => void
}

export default function FileItem({
  file,
  viewMode,
  onOpen,
  onDelete,
  onRename,
  onMove,
  onShare,
  onDownload,
}: FileItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const getFileIcon = () => {
    if (file.type === "folder") return <Folder size={viewMode === "grid" ? 40 : 24} />

    const mimeType = file.mimeType || ""
    const extension = file.extension?.toLowerCase() || ""

    if (mimeType.startsWith("image/")) return <Image size={viewMode === "grid" ? 40 : 24} />
    if (mimeType.startsWith("video/")) return <Video size={viewMode === "grid" ? 40 : 24} />
    if (mimeType.startsWith("audio/")) return <Music size={viewMode === "grid" ? 40 : 24} />

    if (["pdf"].includes(extension)) return <FileText size={viewMode === "grid" ? 40 : 24} />
    if (["doc", "docx", "txt", "rtf"].includes(extension)) return <FileText size={viewMode === "grid" ? 40 : 24} />
    if (["xls", "xlsx", "csv"].includes(extension)) return <FileSpreadsheet size={viewMode === "grid" ? 40 : 24} />
    if (["zip", "rar", "tar", "gz"].includes(extension)) return <FileArchive size={viewMode === "grid" ? 40 : 24} />
    if (["js", "ts", "html", "css", "py", "java", "php"].includes(extension))
      return <FileCode size={viewMode === "grid" ? 40 : 24} />

    return <File size={viewMode === "grid" ? 40 : 24} />
  }

  const getIconColor = () => {
    if (file.type === "folder") return "#4F46E5"

    const extension = file.extension?.toLowerCase() || ""
    const mimeType = file.mimeType || ""

    if (mimeType.startsWith("image/")) return "#EC4899"
    if (mimeType.startsWith("video/")) return "#F59E0B"
    if (mimeType.startsWith("audio/")) return "#8B5CF6"

    if (["pdf"].includes(extension)) return "#EF4444"
    if (["doc", "docx", "txt", "rtf"].includes(extension)) return "#3B82F6"
    if (["xls", "xlsx", "csv"].includes(extension)) return "#10B981"
    if (["zip", "rar", "tar", "gz"].includes(extension)) return "#6B7280"
    if (["js", "ts", "html", "css", "py", "java", "php"].includes(extension)) return "#F59E0B"

    return "#6B7280"
  }

  // Card animation variants
  const cardVariants = {
    initial: {
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      backgroundColor: "white",
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
    onOpen(file)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
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
        if (onDownload && file.type === "file") onDownload(file)
        break
    }
  }

  return (
    <motion.div
      className={`${styles.fileItem} ${styles[viewMode]}`}
      variants={cardVariants}
      initial="initial"
      animate={isHovered ? "hover" : "initial"}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false)
        if (!showMenu) setShowMenu(false)
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div className={styles.iconContainer} variants={iconVariants} style={{ color: getIconColor() }}>
        {file.thumbnail ? (
          <img src={file.thumbnail || "/placeholder.svg"} alt={file.name} className={styles.thumbnail} />
        ) : (
          getFileIcon()
        )}
      </motion.div>

      <div className={styles.fileDetails}>
        <motion.div
          className={styles.fileName}
          animate={{
            color: isHovered ? "#4F46E5" : "#1f2937",
          }}
        >
          {file.name}
        </motion.div>

        {viewMode === "list" && (
          <>
            <div className={styles.fileDate}>{formatDate(file.updatedAt)}</div>
            {file.type === "file" && file.size && <div className={styles.fileSize}>{formatFileSize(file.size)}</div>}
          </>
        )}
      </div>

      <motion.div
        className={styles.fileActions}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered || showMenu ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <button className={styles.menuButton} onClick={handleMenuClick} aria-label="More options">
          <MoreVertical size={18} />
        </button>

        {showMenu && (
          <motion.div
            className={styles.menuDropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button className={styles.menuItem} onClick={(e) => handleActionClick(e, "rename")}>
              <Edit size={16} />
              <span>Rename</span>
            </button>

            {file.type === "file" && (
              <button className={styles.menuItem} onClick={(e) => handleActionClick(e, "download")}>
                <Download size={16} />
                <span>Download</span>
              </button>
            )}

            <button className={styles.menuItem} onClick={(e) => handleActionClick(e, "move")}>
              <Move size={16} />
              <span>Move</span>
            </button>

            <button className={styles.menuItem} onClick={(e) => handleActionClick(e, "share")}>
              <Share2 size={16} />
              <span>Share</span>
            </button>

            <button
              className={`${styles.menuItem} ${styles.deleteItem}`}
              onClick={(e) => handleActionClick(e, "delete")}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

