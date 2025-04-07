"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import styles from "./Modal.module.css"
import { X } from "lucide-react"
import type { FileItem } from "../../types/File"

interface RenameModalProps {
  file: FileItem
  onClose: () => void
  onConfirm: (newName: string) => void
}

export default function RenameModal({ file, onClose, onConfirm }: RenameModalProps) {
  const [newName, setNewName] = useState(file.name)
  const [error, setError] = useState("")

  useEffect(() => {
    // If it's a file, select just the name part without extension
    if (file.type === "file" && file.extension) {
      const nameWithoutExt = file.name.slice(0, -(file.extension.length + 1))
      setNewName(nameWithoutExt)
    } else {
      setNewName(file.name)
    }
  }, [file])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newName.trim()) {
      setError("Name cannot be empty")
      return
    }

    // For files, append the extension back
    let finalName = newName.trim()
    if (file.type === "file" && file.extension) {
      finalName = `${finalName}.${file.extension}`
    }

    onConfirm(finalName)
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
          <h3>Rename {file.type === "folder" ? "Folder" : "File"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label htmlFor="newName">New Name</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="newName"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setError("")
                  }}
                  className={styles.input}
                  autoFocus
                />
                {file.type === "file" && file.extension && (
                  <span className={styles.inputSuffix}>.{file.extension}</span>
                )}
              </div>
              {error && <p className={styles.errorText}>{error}</p>}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton}>
              Rename
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

