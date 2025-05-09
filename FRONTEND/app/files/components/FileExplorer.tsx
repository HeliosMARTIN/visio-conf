"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { AnimatePresence } from "framer-motion"
import type { FileItem, ViewMode, SortBy, SortOrder } from "../../../types/File"
import FileList from "./FileList"
import styles from "./FileExplorer.module.css"
import {
    Search,
    Grid,
    List,
    ChevronUp,
    ChevronDown,
    Upload,
    FolderPlus,
    ArrowLeft,
    Home,
} from "lucide-react"
import CreateFolderModal from "./CreateFolderModal"
import RenameModal from "./RenameModal"
import DeleteModal from "./DeleteModal"
import MoveFileModal from "./MoveFileModal"
import ShareModal from "./ShareModal"
import { useAppContext } from "@/context/AppContext"

interface FileExplorerProps {
    files: FileItem[]
    currentPath: string[]
    isLoading: boolean
    onFetchFiles: (folderId?: string) => void
    onCreateFolder: (name: string) => void
    onUploadFile: (file: File) => void
    onDeleteFile: (fileId: string) => void
    onRenameFile: (fileId: string, newName: string) => void
    onMoveFile: (fileId: string, newParentId: string) => void
    onShareFile: (fileId: string, isPublic: boolean) => void
    onNavigate: (folderId?: string) => void
    onDownloadFile?: (fileId: string) => void
}

export default function FileExplorer({
    files,
    currentPath,
    isLoading,
    onFetchFiles,
    onCreateFolder,
    onUploadFile,
    onDeleteFile,
    onRenameFile,
    onMoveFile,
    onShareFile,
    onNavigate,
}: FileExplorerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [sortBy, setSortBy] = useState<SortBy>("name")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>(files)
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
    const [showRenameModal, setShowRenameModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showMoveModal, setShowMoveModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { currentUser } = useAppContext()

    // Get folder names for breadcrumbs
    const [folderNames, setFolderNames] = useState<Record<string, string>>({})

    useEffect(() => {
        // Update folder names from files
        const newFolderNames: Record<string, string> = {}
        files.forEach((file) => {
            if (file.type === "folder") {
                newFolderNames[file.id] = file.name
            }
        })
        setFolderNames((prev) => ({ ...prev, ...newFolderNames }))
    }, [files])

    useEffect(() => {
        let sorted = [...files]

        // Apply sorting
        sorted.sort((a, b) => {
            // Always sort folders before files
            if (a.type === "folder" && b.type === "file") return -1
            if (a.type === "file" && b.type === "folder") return 1

            // Then apply the selected sort
            switch (sortBy) {
                case "name":
                    return sortOrder === "asc"
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name)
                case "date":
                    return sortOrder === "asc"
                        ? new Date(a.updatedAt).getTime() -
                              new Date(b.updatedAt).getTime()
                        : new Date(b.updatedAt).getTime() -
                              new Date(a.updatedAt).getTime()
                case "size":
                    const aSize = a.size || 0
                    const bSize = b.size || 0
                    return sortOrder === "asc" ? aSize - bSize : bSize - aSize
                case "type":
                    const aExt = a.extension || ""
                    const bExt = b.extension || ""
                    return sortOrder === "asc"
                        ? aExt.localeCompare(bExt)
                        : bExt.localeCompare(aExt)
                default:
                    return 0
            }
        })

        // Apply search filter
        if (searchTerm.trim() !== "") {
            sorted = sorted.filter((file) =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredFiles(sorted)
    }, [files, sortBy, sortOrder, searchTerm])

    const handleSortChange = (newSortBy: SortBy) => {
        if (sortBy === newSortBy) {
            // Toggle sort order if clicking the same sort option
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            // Set new sort by and default to ascending
            setSortBy(newSortBy)
            setSortOrder("asc")
        }
    }

    const handleOpenFile = (file: FileItem) => {
        if (file.type === "folder") {
            onNavigate(file.id)
        } else {
            // For image files, open the thumbnail or download
            if (file.mimeType?.startsWith("image/")) {
                window.open(
                    `https://visioconfbucket.s3.eu-north-1.amazonaws.com/files/${currentUser?.id}/${file.name}`,
                    "_blank"
                )
            }
        }
    }

    const handleDeleteFile = (file: FileItem) => {
        setSelectedFile(file)
        setShowDeleteModal(true)
    }

    const handleRenameFile = (file: FileItem) => {
        setSelectedFile(file)
        setShowRenameModal(true)
    }

    const handleMoveFile = (file: FileItem) => {
        setSelectedFile(file)
        setShowMoveModal(true)
    }

    const handleShareFile = (file: FileItem) => {
        setSelectedFile(file)
        setShowShareModal(true)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            onUploadFile(file)

            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleConfirmCreateFolder = (name: string) => {
        onCreateFolder(name)
        setShowCreateFolderModal(false)
    }

    const handleConfirmDelete = () => {
        if (selectedFile) {
            onDeleteFile(selectedFile.id)
            setShowDeleteModal(false)
            setSelectedFile(null)
        }
    }

    const handleConfirmRename = (fileId: string, newName: string) => {
        onRenameFile(fileId, newName)
        setShowRenameModal(false)
        setSelectedFile(null)
    }

    const handleConfirmMove = (fileId: string, newParentId: string) => {
        onMoveFile(fileId, newParentId)
        setShowMoveModal(false)
        setSelectedFile(null)
    }

    const handleConfirmShare = (fileId: string, isPublic: boolean) => {
        onShareFile(fileId, isPublic)
        setShowShareModal(false)
        setSelectedFile(null)
    }

    const handleNavigateUp = () => {
        if (currentPath.length > 1) {
            // Navigate to parent folder
            const parentPath = [...currentPath]
            parentPath.pop() // Remove current folder
            const parentId = parentPath[parentPath.length - 1]
            onNavigate(parentId)
        } else if (currentPath.length === 1) {
            // Navigate to root
            onNavigate()
        }
    }

    const handleNavigateHome = () => {
        onNavigate()
    }

    const handleNavigateToBreadcrumb = (index: number) => {
        if (index === -1) {
            // Navigate to root
            onNavigate()
        } else {
            // Navigate to the folder at the specified index
            onNavigate(currentPath[index])
        }
    }

    return (
        <div className={styles.fileExplorer}>
            <div className={styles.toolbar}>
                <div className={styles.navigation}>
                    <button
                        className={styles.navButton}
                        onClick={handleNavigateHome}
                        disabled={currentPath.length === 0}
                    >
                        <Home size={18} />
                    </button>

                    <button
                        className={styles.navButton}
                        onClick={handleNavigateUp}
                        disabled={currentPath.length === 0}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className={styles.breadcrumbs}>
                        {currentPath.length === 0 ? (
                            <span className={styles.breadcrumbItem}>Home</span>
                        ) : (
                            <>
                                <span
                                    className={`${styles.breadcrumbItem} ${styles.breadcrumbLink}`}
                                    onClick={() =>
                                        handleNavigateToBreadcrumb(-1)
                                    }
                                >
                                    Home
                                </span>
                                {currentPath.map((folderId, index) => (
                                    <span key={folderId}>
                                        <span
                                            className={
                                                styles.breadcrumbSeparator
                                            }
                                        >
                                            /
                                        </span>
                                        <span
                                            className={`${
                                                styles.breadcrumbItem
                                            } ${
                                                index < currentPath.length - 1
                                                    ? styles.breadcrumbLink
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                if (
                                                    index <
                                                    currentPath.length - 1
                                                ) {
                                                    handleNavigateToBreadcrumb(
                                                        index
                                                    )
                                                }
                                            }}
                                        >
                                            {folderNames[folderId] || "Folder"}
                                        </span>
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.viewControls}>
                    <button
                        className={`${styles.viewButton} ${
                            viewMode === "grid" ? styles.active : ""
                        }`}
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        className={`${styles.viewButton} ${
                            viewMode === "list" ? styles.active : ""
                        }`}
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {viewMode === "list" && (
                <div className={styles.listHeader}>
                    <div
                        className={`${styles.listHeaderItem} ${styles.nameHeader}`}
                        onClick={() => handleSortChange("name")}
                    >
                        Name
                        {sortBy === "name" && (
                            <span className={styles.sortIcon}>
                                {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </span>
                        )}
                    </div>
                    <div
                        className={`${styles.listHeaderItem} ${styles.dateHeader}`}
                        onClick={() => handleSortChange("date")}
                    >
                        Modified
                        {sortBy === "date" && (
                            <span className={styles.sortIcon}>
                                {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </span>
                        )}
                    </div>
                    <div
                        className={`${styles.listHeaderItem} ${styles.sizeHeader}`}
                        onClick={() => handleSortChange("size")}
                    >
                        Size
                        {sortBy === "size" && (
                            <span className={styles.sortIcon}>
                                {sortOrder === "asc" ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </span>
                        )}
                    </div>
                    <div
                        className={styles.listHeaderItem}
                        style={{ width: "40px" }}
                    ></div>
                </div>
            )}

            <div className={styles.fileListContainer}>
                <FileList
                    files={filteredFiles}
                    viewMode={viewMode}
                    isLoading={isLoading}
                    onOpenFile={handleOpenFile}
                    onDeleteFile={handleDeleteFile}
                    onRenameFile={handleRenameFile}
                    onMoveFile={handleMoveFile}
                    onShareFile={handleShareFile}
                />
            </div>

            <div className={styles.actionBar}>
                <button
                    className={styles.actionButton}
                    onClick={() => setShowCreateFolderModal(true)}
                >
                    <FolderPlus size={18} />
                    <span>New Folder</span>
                </button>

                <label className={styles.actionButton}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                    />
                    <Upload size={18} />
                    <span>Upload</span>
                </label>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCreateFolderModal && (
                    <CreateFolderModal
                        isOpen={showCreateFolderModal}
                        onCreateFolder={handleConfirmCreateFolder}
                        onCloseModal={() => setShowCreateFolderModal(false)}
                    />
                )}

                {showRenameModal && selectedFile && (
                    <RenameModal
                        isOpen={showRenameModal}
                        file={selectedFile}
                        onRenameFile={handleConfirmRename}
                        onCloseModal={() => setShowRenameModal(false)}
                    />
                )}

                {showDeleteModal && selectedFile && (
                    <DeleteModal
                        isOpen={showDeleteModal}
                        file={selectedFile}
                        onDeleteFile={handleConfirmDelete}
                        onCloseModal={() => setShowDeleteModal(false)}
                    />
                )}

                {showMoveModal && selectedFile && (
                    <MoveFileModal
                        isOpen={showMoveModal}
                        file={selectedFile}
                        onMoveFile={handleConfirmMove}
                        onCloseModal={() => setShowMoveModal(false)}
                    />
                )}

                {showShareModal && selectedFile && (
                    <ShareModal
                        isOpen={showShareModal}
                        file={selectedFile}
                        onShareFile={handleConfirmShare}
                        onCloseModal={() => setShowShareModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
