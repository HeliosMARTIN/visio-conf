import File from "../models/file.js"
import AwsS3Service from "./AwsS3Service.js"

class ThumbnailService {
    constructor(controleur, nom) {
        this.controleur = controleur
        this.nomDInstance = nom
        this.verbose = false
        this.listeDesMessagesEmis = []
        this.listeDesMessagesRecus = ["file_upload_response"]

        this.awsS3Service = new AwsS3Service(
            controleur,
            "AwsS3ServiceForThumbnails"
        )

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

        // Listen for successful file uploads that need thumbnails
        if (
            mesg.file_upload_response &&
            mesg.file_upload_response.etat &&
            mesg.file_upload_response.generateThumbnail
        ) {
            try {
                const { fileId } = mesg.file_upload_response

                // Find the file
                const file = await File.findOne({ id: fileId })

                if (!file) return

                // Wait a bit to ensure the file is fully uploaded
                setTimeout(async () => {
                    try {
                        // Generate thumbnail
                        const thumbnailPath =
                            await this.awsS3Service.generateThumbnail(file.path)

                        // Update the file record with the thumbnail path
                        file.thumbnail = thumbnailPath
                        await file.save()

                        if (this.verbose)
                            console.log(
                                `Generated thumbnail for file ${fileId}: ${thumbnailPath}`
                            )
                    } catch (error) {
                        console.error(
                            `Error generating thumbnail for file ${fileId}:`,
                            error
                        )
                    }
                }, 5000) // Wait 5 seconds to ensure the file is uploaded
            } catch (error) {
                console.error("Error processing thumbnail generation:", error)
            }
        }
    }
}

export default ThumbnailService
