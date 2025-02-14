import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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
            const fileName = media.name
            const fileType = media.fileType
            const fileBuffer = Buffer.from(media.data, "base64")

            const params = {
                Bucket: this.bucket,
                Key: fileName,
                Body: fileBuffer,
                ContentType: fileType,
                ACL: "public-read", // Ajout de l'ACL pour rendre l'objet public
            }
            const command = new PutObjectCommand(params)
            try {
                await this.client.send(command)
                const message = {
                    upload_response: {
                        etat: true,
                        url: `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
                    },
                }

                this.controleur.envoie(this, message)
            } catch (error) {
                console.error(
                    "AwsS3Service: Error uploading file to S3:",
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
