import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

class AwsS3Service {
    constructor(controleur, nom) {
        this.controleur = controleur
        this.nomDInstance = nom
        this.verbose = false
        this.listeDesMessagesEmis = [
            "upload_response",
            "file_upload_response",
            "file_download_response",
        ]
        this.listeDesMessagesRecus = [
            "upload_request",
            "file_upload_request",
            "file_download_request",
        ]

        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): s'enregistre auprès du controleur"
            )
        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        )

        this.client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        })
        this.bucket = process.env.S3_BUCKET
    }

    async traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose) {
            console.log(
                "INFO (" + this.nomDInstance + "): reçoit le message à traiter"
            )
            console.log(mesg)
        }

        // Handle original upload request (keep for backward compatibility)
        if (mesg.upload_request) {
            // Expect media to be an object with { name, fileType, data }
            const { media } = mesg.upload_request
            const safeFileName = media.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
            const fileType = media.fileType
            const params = {
                Bucket: this.bucket,
                Key: safeFileName,
                ContentType: fileType,
                ACL: "public-read",
            }
            const command = new PutObjectCommand(params)
            try {
                const signedUrl = await getSignedUrl(this.client, command, {
                    expiresIn: 60,
                })
                const message = {
                    upload_response: {
                        etat: true,
                        fileName: safeFileName,
                        signedUrl,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            } catch (error) {
                console.error(
                    "AwsS3Service: Error generating presigned URL:",
                    error
                )
                const message = {
                    upload_response: {
                        etat: false,
                        error: error.message,
                    },
                    id: [mesg.id],
                }
                this.controleur.envoie(this, message)
            }
        }

        // Handle file upload request for the file explorer
        if (mesg.file_upload_request) {
            try {
                const { userId, name, mimeType } = mesg.file_upload_request

                const safeFileName = name.replace(/[^a-zA-Z0-9_.-]/g, "_")

                // Generate a path for the file in S3
                const filePath = `files/${userId}/${safeFileName}`

                // Generate a signed URL for uploading
                const signedUrl = await this.getSignedUploadUrl(
                    filePath,
                    mimeType
                )

                const message = {
                    file_upload_response: {
                        etat: true,
                        signedUrl,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                console.error(
                    "AwsS3Service: Error handling file upload request:",
                    error
                )
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

        // Handle file download request
        if (mesg.file_download_request) {
            try {
                const { fileId, filePath } = mesg.file_download_request

                // Generate a signed URL for downloading
                const downloadUrl = await this.getSignedDownloadUrl(filePath)

                const message = {
                    file_download_response: {
                        etat: true,
                        fileId,
                        downloadUrl,
                    },
                    id: [mesg.id],
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                console.error(
                    "AwsS3Service: Error handling file download request:",
                    error
                )
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

    // Generate a signed URL for uploading a file to S3
    async getSignedUploadUrl(filePath, contentType) {
        try {
            const params = {
                Bucket: this.bucket,
                Key: filePath,
                ContentType: contentType,
                ACL: "public-read",
            }

            const command = new PutObjectCommand(params)

            // Generate a signed URL that expires in 15 minutes
            const signedUrl = await getSignedUrl(this.client, command, {
                expiresIn: 900,
            })

            return signedUrl
        } catch (error) {
            console.error("Error generating signed upload URL:", error)
            throw error
        }
    }

    // Generate a signed URL for downloading a file from S3
    async getSignedDownloadUrl(filePath) {
        try {
            const params = {
                Bucket: this.bucket,
                Key: filePath,
            }

            const command = new GetObjectCommand(params)

            // Generate a signed URL that expires in 15 minutes
            const signedUrl = await getSignedUrl(this.client, command, {
                expiresIn: 900,
            })

            return signedUrl
        } catch (error) {
            console.error("Error generating signed download URL:", error)
            throw error
        }
    }

    // Delete a file from S3
    async deleteFile(filePath) {
        try {
            const params = {
                Bucket: this.bucket,
                Key: filePath,
            }

            const command = new DeleteObjectCommand(params)

            await this.client.send(command)

            return true
        } catch (error) {
            console.error("Error deleting file from S3:", error)
            throw error
        }
    }
}

export default AwsS3Service
