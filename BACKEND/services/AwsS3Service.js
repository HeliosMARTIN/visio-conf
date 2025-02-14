import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

class AwsS3Service {
    constructor(controleur, nom) {
        this.controleur = controleur
        this.nomDInstance = nom
        this.verbose = false
        this.listeDesMessagesEmis = ["upload_response"]
        this.listeDesMessagesRecus = ["upload_request"]

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
                }
                this.controleur.envoie(this, message)
            }
        }
    }
}

export default AwsS3Service
