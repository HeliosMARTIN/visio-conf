"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import styles from "./Modal.module.css"
import { X, Folder, ChevronRight } from "lucide-react"
import type { FileItem } from "../../types/File"

interface MoveFileModalProps {
  file: FileItem
  currentPath: string[]
  onClose: () => void
  onConfirm: (newParentId: string) => void
  onFetchFolders: (folderId?: string) => void
}

export default function MoveFileModal({ file, currentPath, onClose, onConfirm, onFetchFolders }: MoveFileModalProps) {
  const [folders, setFolders] = useState<FileItem[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch folders for the root level initially
    fetchFolders()
  }, [])

  const fetchFolders = async (folderId?: string) => {
    setIsLoading(true)
    try {
      // This would be replaced with your actual folder fetching logic
      onFetchFolders(folderId)
      // For now, we'll simulate some folders
      const mockFolders: FileItem[] = [
        {
          id: "folder1",
          name: "Documents",
          type: "folder",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: "user1",
        },
        {
          id: "folder2",
          name: "Images",
          type: "folder",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: "user1",
        },
      ]
      setFolders(mockFolders)
    } catch (error) {
      console.error("Error fetching folders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFolderId) {
      onConfirm(selectedFolderId)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Move {file.type === "folder" ? "Folder" : "File"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p>Select destination folder:</p>

            <div className={styles.folderList}>
              <div
                className={`${styles.folderItem} ${selectedFolderId === "" ? styles.selected : ""}`}
                onClick={() => handleFolderClick("")}
              >
                <Folder size={18} />
                <span>Home</span>
              </div>

              {isLoading ? (
                <div className={styles.loading}>Loading folders...</div>
              ) : (
                folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`${styles.folderItem} ${selectedFolderId === folder.id ? styles.selected : ""}`}
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <Folder size={18} />
                    <span>{folder.name}</span>
                    <ChevronRight size={16} className={styles.folderItemIcon} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton} disabled={!selectedFolderId}>
              Move
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

