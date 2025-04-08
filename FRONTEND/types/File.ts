export interface FileItem {
    id: string
    name: string
    type: "file" | "folder"
    size?: number
    mimeType?: string
    extension?: string
    createdAt: string
    updatedAt: string
    parentId?: string | null
    ownerId: string
    shared?: boolean
    thumbnail?: string
}

export interface FileListResponse {
    etat: boolean
    files?: FileItem[]
    error?: string
}

export interface FileUploadResponse {
    etat: boolean
    fileId?: string
    fileName?: string
    signedUrl?: string
    error?: string
}

export interface FileDeleteResponse {
    etat: boolean
    fileId?: string
    error?: string
}

export interface FileMoveResponse {
    etat: boolean
    fileId?: string
    newParentId?: string
    error?: string
}

export interface FileRenameResponse {
    etat: boolean
    fileId?: string
    newName?: string
    error?: string
}

export interface FolderCreateResponse {
    etat: boolean
    folderId?: string
    folderName?: string
    error?: string
}

export type ViewMode = "grid" | "list"
export type SortBy = "name" | "date" | "size" | "type"
export type SortOrder = "asc" | "desc"
