import File from "../models/file.js"
import { v4 as uuidv4 } from "uuid"
import SocketIdentificationService from "./SocketIdentification.js"

class FileService {
    constructor(controleur, nom) {
        this.controleur = controleur
        this.nomDInstance = nom
        this.verbose = false
        this.listeDesMessagesEmis = [
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
        this.listeDesMessagesRecus = [
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

        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "):  s'enregistre aupres du controleur"
            )

        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        )
    }

    async traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose) {
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): reçoit le message suivant à traiter"
            )
            console.log(mesg)
        }

        // Handle files list request
        if (mesg.files_list_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                console.log("ici socket id", socketId)

                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { folderId } = mesg.files_list_request

                // Query parameters
                const query = {
                    ownerId: userInfo.uuid,
                    deleted: false,
                }

                // If folderId is provided, get files in that folder
                // Otherwise, get files in the root folder
                if (folderId) {
                    query.parentId = folderId
                } else {
                    query.parentId = null
                }

                // Get files and folders
                const files = await File.find(query).sort({ type: 1, name: 1 })

                // Format the response
                const formattedFiles = files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    mimeType: file.mimeType,
                    extension: file.extension,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt,
                    parentId: file.parentId,
                    ownerId: file.ownerId,
                    shared: file.shared,
                    thumbnail: file.thumbnail,
                }))

                const message = {
                    files_list_response: {
                        etat: true,
                        files: formattedFiles,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    files_list_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle folders list request (for move file modal)
        if (mesg.folders_list_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { excludeFolderId } = mesg.folders_list_request

                // Query parameters - only get folders
                const query = {
                    ownerId: userInfo.uuid,
                    type: "folder",
                    deleted: false,
                }

                // If excludeFolderId is provided, exclude that folder and its descendants
                let excludedFolderIds = []
                if (excludeFolderId) {
                    // Get the folder to exclude
                    excludedFolderIds.push(excludeFolderId)

                    // Get all descendant folders to exclude
                    const descendantFolders =
                        await this.getAllDescendantFolders(
                            excludeFolderId,
                            userInfo.uuid
                        )
                    excludedFolderIds = [
                        ...excludedFolderIds,
                        ...descendantFolders.map((folder) => folder.id),
                    ]

                    // Add the excluded folder IDs to the query
                    query.id = { $nin: excludedFolderIds }
                }

                // Get folders
                const folders = await File.find(query).sort({ name: 1 })

                // Format the response
                const formattedFolders = folders.map((folder) => ({
                    id: folder.id,
                    name: folder.name,
                    type: folder.type,
                    createdAt: folder.createdAt,
                    updatedAt: folder.updatedAt,
                    parentId: folder.parentId,
                    ownerId: folder.ownerId,
                }))

                const message = {
                    folders_list_response: {
                        etat: true,
                        folders: formattedFolders,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    folders_list_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file upload request
        if (mesg.file_upload_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { name, size, mimeType, extension, parentId } =
                    mesg.file_upload_request

                // Generate a unique file ID
                const fileId = uuidv4()

                // Generate a unique path for the file in S3
                const filePath = `files/${userInfo.uuid}/${fileId}/${name}`

                // Create a new file record
                const newFile = new File({
                    id: fileId,
                    name,
                    type: "file",
                    size,
                    mimeType,
                    extension,
                    parentId: parentId || null,
                    ownerId: userInfo.uuid,
                    path: filePath,
                })

                // Save the file record
                await newFile.save()

                // Forward the request to the AwsS3Service to get a signed URL
                const uploadRequest = {
                    file_upload_request: {
                        fileId,
                        fileName: name,
                        mimeType,
                        parentId,
                        ownerId: userInfo.uuid,
                    },
                    id: mesg.id,
                }

                // The AwsS3Service will handle the response directly
                this.controleur.envoie(this, uploadRequest)
            } catch (error) {
                const message = {
                    file_upload_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file delete request
        if (mesg.file_delete_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { fileId } = mesg.file_delete_request

                // Find the file
                const file = await File.findOne({
                    id: fileId,
                    ownerId: userInfo.uuid,
                })

                if (!file)
                    throw new Error(
                        "File not found or you don't have permission"
                    )

                // If it's a folder, recursively mark all children as deleted
                if (file.type === "folder") {
                    await this.recursiveDelete(fileId, userInfo.uuid)
                } else {
                    // Mark the file as deleted (soft delete)
                    file.deleted = true
                    file.deletedAt = new Date()
                    await file.save()

                    // Note: You might want to implement a cleanup job to actually delete files from S3 after some time
                }

                const message = {
                    file_delete_response: {
                        etat: true,
                        fileId,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    file_delete_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file rename request
        if (mesg.file_rename_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { fileId, newName } = mesg.file_rename_request

                // Find the file
                const file = await File.findOne({
                    id: fileId,
                    ownerId: userInfo.uuid,
                })

                if (!file)
                    throw new Error(
                        "File not found or you don't have permission"
                    )

                // Update the file name
                file.name = newName
                file.updatedAt = new Date()
                await file.save()

                const message = {
                    file_rename_response: {
                        etat: true,
                        fileId,
                        newName,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    file_rename_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file move request
        if (mesg.file_move_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { fileId, newParentId } = mesg.file_move_request

                // Find the file
                const file = await File.findOne({
                    id: fileId,
                    ownerId: userInfo.uuid,
                })

                if (!file)
                    throw new Error(
                        "File not found or you don't have permission"
                    )

                // If moving to a folder, make sure the folder exists and belongs to the user
                if (newParentId) {
                    const parentFolder = await File.findOne({
                        id: newParentId,
                        type: "folder",
                        ownerId: userInfo.uuid,
                    })

                    if (!parentFolder)
                        throw new Error(
                            "Destination folder not found or you don't have permission"
                        )

                    // Check for circular reference (can't move a folder into its own descendant)
                    if (file.type === "folder") {
                        const isCircular = await this.isCircularReference(
                            fileId,
                            newParentId
                        )
                        if (isCircular)
                            throw new Error(
                                "Cannot move a folder into its own descendant"
                            )
                    }
                }

                // Update the file's parent
                file.parentId = newParentId || null
                file.updatedAt = new Date()
                await file.save()

                const message = {
                    file_move_response: {
                        etat: true,
                        fileId,
                        newParentId,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    file_move_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file share request
        if (mesg.file_share_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { fileId, isPublic, userIds } = mesg.file_share_request

                // Find the file
                const file = await File.findOne({
                    id: fileId,
                    ownerId: userInfo.uuid,
                })

                if (!file)
                    throw new Error(
                        "File not found or you don't have permission"
                    )

                // Update sharing settings
                file.shared = isPublic

                // If specific users are provided, update the sharedWith array
                if (userIds && Array.isArray(userIds)) {
                    file.sharedWith = userIds
                }

                file.updatedAt = new Date()
                await file.save()

                const message = {
                    file_share_response: {
                        etat: true,
                        fileId,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    file_share_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle folder create request
        if (mesg.folder_create_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { name, parentId } = mesg.folder_create_request

                // If parent folder is specified, make sure it exists and belongs to the user
                if (parentId) {
                    const parentFolder = await File.findOne({
                        id: parentId,
                        type: "folder",
                        ownerId: userInfo.uuid,
                    })

                    if (!parentFolder)
                        throw new Error(
                            "Parent folder not found or you don't have permission"
                        )
                }

                // Generate a unique folder ID
                const folderId = uuidv4()

                // Create a new folder record
                const newFolder = new File({
                    id: folderId,
                    name,
                    type: "folder",
                    parentId: parentId || null,
                    ownerId: userInfo.uuid,
                })

                // Save the folder record
                await newFolder.save()

                const message = {
                    folder_create_response: {
                        etat: true,
                        folderId,
                        folderName: name,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                const message = {
                    folder_create_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file download request
        if (mesg.file_download_request) {
            try {
                const socketId = mesg.id
                if (!socketId) throw new Error("Sender socket id not available")

                // Get user info from socket ID
                const userInfo =
                    await SocketIdentificationService.getUserInfoBySocketId(
                        socketId
                    )
                if (!userInfo)
                    throw new Error("User not found based on socket id")

                const { fileId } = mesg.file_download_request

                // Find the file
                const file = await File.findOne({
                    id: fileId,
                    type: "file",
                    $or: [
                        { ownerId: userInfo.uuid },
                        { shared: true },
                        { sharedWith: userInfo.uuid },
                    ],
                })

                if (!file)
                    throw new Error(
                        "File not found or you don't have permission"
                    )

                // Forward the request to the AwsS3Service to get a signed URL
                const downloadRequest = {
                    file_download_request: {
                        fileId,
                        filePath: file.path,
                    },
                    id: mesg.id,
                }

                // The AwsS3Service will handle the response directly
                this.controleur.envoie(this, downloadRequest)
            } catch (error) {
                const message = {
                    file_download_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }
    }

    // Helper method to get all descendant folders of a given folder
    async getAllDescendantFolders(folderId, ownerId) {
        const descendants = []

        // Get immediate children
        const children = await File.find({
            parentId: folderId,
            type: "folder",
            ownerId: ownerId,
            deleted: false,
        })

        // Add children to descendants
        descendants.push(...children)

        // Recursively get descendants of each child
        for (const child of children) {
            const childDescendants = await this.getAllDescendantFolders(
                child.id,
                ownerId
            )
            descendants.push(...childDescendants)
        }

        return descendants
    }

    // Helper method to recursively mark files and folders as deleted
    async recursiveDelete(folderId, ownerId) {
        // Mark the folder as deleted
        await File.updateOne(
            { id: folderId, ownerId },
            { deleted: true, deletedAt: new Date() }
        )

        // Find all children of this folder
        const children = await File.find({ parentId: folderId, ownerId })

        // Recursively delete all child folders
        for (const child of children) {
            if (child.type === "folder") {
                await this.recursiveDelete(child.id, ownerId)
            } else {
                // Mark child files as deleted
                child.deleted = true
                child.deletedAt = new Date()
                await child.save()
            }
        }
    }

    // Helper method to check if moving a folder would create a circular reference
    async isCircularReference(sourceFolderId, targetFolderId) {
        // If source and target are the same, it's circular
        if (sourceFolderId === targetFolderId) return true

        // Check if target is a descendant of source
        let currentId = targetFolderId

        while (currentId) {
            const folder = await File.findOne({ id: currentId })
            if (!folder) break

            if (folder.parentId === sourceFolderId) return true
            currentId = folder.parentId
        }

        return false
    }
}

export default FileService
