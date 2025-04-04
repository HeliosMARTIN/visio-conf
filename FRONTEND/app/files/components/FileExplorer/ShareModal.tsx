"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import styles from "./Modal.module.css"
import { X, Copy, Check } from "lucide-react"
import type { FileItem } from "../../types/File"

interface ShareModalProps {
  file: FileItem
  onClose: () => void
  onConfirm: (isPublic: boolean) => void
}

export default function ShareModal({ file, onClose, onConfirm }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(file.shared || false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://example.com/shared/${file.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(isPublic)
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
          <h3>Share {file.name}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Make {file.type === "folder" ? "folder" : "file"} public</span>
              </label>
            </div>

            {isPublic && (
              <div className={styles.shareLink}>
                <input type="text" value={shareUrl} readOnly className={styles.input} />
                <button type="button" className={styles.copyButton} onClick={handleCopyLink}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmButton}>
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

