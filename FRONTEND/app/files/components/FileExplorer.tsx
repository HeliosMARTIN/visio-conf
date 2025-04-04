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

interface FileExplorerProps {
    files: FileItem[]
    currentPath: string[]
    isLoading: boolean
    onFetchFiles: (folderId?: string) => void
    onCreateFolder: (name: string, parentId?: string) => void
    onUploadFile: (file: File, parentId?: string) => void
    onDeleteFile: (fileId: string) => void
    onRenameFile: (fileId: string, newName: string) => void
    onMoveFile: (fileId: string, newParentId: string) => void
    onShareFile: (fileId: string, isPublic: boolean) => void
    onNavigate: (folderId?: string, folderName?: string) => void
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
    onDownloadFile,
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
            onNavigate(file.id, file.name)
        } else {
            // Handle file opening logic here
            console.log("Opening file:", file.name)
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

    const handleDownloadFile = (file: FileItem) => {
        if (onDownloadFile && file.type === "file") {
            onDownloadFile(file.id)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            onUploadFile(
                file,
                currentPath.length > 0
                    ? currentPath[currentPath.length - 1]
                    : undefined
            )

            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleCreateFolder = (name: string) => {
        onCreateFolder(
            name,
            currentPath.length > 0
                ? currentPath[currentPath.length - 1]
                : undefined
        )
        setShowCreateFolderModal(false)
    }

    const handleConfirmDelete = () => {
        if (selectedFile) {
            onDeleteFile(selectedFile.id)
            setShowDeleteModal(false)
            setSelectedFile(null)
        }
    }

    const handleConfirmRename = (newName: string) => {
        if (selectedFile) {
            onRenameFile(selectedFile.id, newName)
            setShowRenameModal(false)
            setSelectedFile(null)
        }
    }

    const handleConfirmMove = (newParentId: string) => {
        if (selectedFile) {
            onMoveFile(selectedFile.id, newParentId)
            setShowMoveModal(false)
            setSelectedFile(null)
        }
    }

    const handleConfirmShare = (isPublic: boolean) => {
        if (selectedFile) {
            onShareFile(selectedFile.id, isPublic)
            setShowShareModal(false)
            setSelectedFile(null)
        }
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
                                    onClick={handleNavigateHome}
                                >
                                    Home
                                </span>
                                <span className={styles.breadcrumbSeparator}>
                                    /
                                </span>
                                {/* Display the current folder name */}
                                <span className={styles.breadcrumbItem}>
                                    {/* This would be the folder name, assuming it's the last item in the path */}
                                    Current Folder
                                </span>
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
                    onDownloadFile={handleDownloadFile}
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
                        onClose={() => setShowCreateFolderModal(false)}
                        onConfirm={handleCreateFolder}
                    />
                )}

                {showRenameModal && selectedFile && (
                    <RenameModal
                        file={selectedFile}
                        onClose={() => setShowRenameModal(false)}
                        onConfirm={handleConfirmRename}
                    />
                )}

                {showDeleteModal && selectedFile && (
                    <DeleteModal
                        file={selectedFile}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleConfirmDelete}
                    />
                )}

                {showMoveModal && selectedFile && (
                    <MoveFileModal
                        file={selectedFile}
                        currentPath={currentPath}
                        onClose={() => setShowMoveModal(false)}
                        onConfirm={handleConfirmMove}
                        onFetchFolders={onFetchFiles}
                    />
                )}

                {showShareModal && selectedFile && (
                    <ShareModal
                        file={selectedFile}
                        onClose={() => setShowShareModal(false)}
                        onConfirm={handleConfirmShare}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
