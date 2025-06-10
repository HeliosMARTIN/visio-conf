import express from "express"
import cors from "cors"
import path from "path"
import { createServer } from "http"
import { Server } from "socket.io"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import jwt from "jsonwebtoken"
import CanalSocketio from "./canalsocketio.js"
import Controleur from "./controleur.js"
import UsersService from "./services/Users.js"
import MessagesService from "./services/Messages.js"
import AwsS3Service from "./services/AwsS3Service.js"
import RolesService from "./services/Roles.js"
import PermsService from "./services/Perms.js"
import SocketIdentificationService from "./services/SocketIdentification.js"
import FileService from "./services/FileService.js"
import ChannelsService from "./services/ChannelsService.js"
import TeamsService from "./services/TeamsService.js"
// Ajouter l'import de initDb.js en haut du fichier avec les autres imports
import initDb from "./initDb.js"

dotenv.config()

// Pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3220
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

io.on("connection", (socket) => {
  socket.on("authenticate", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userId = decoded.userId
      await SocketIdentificationService.updateUserSocket(userId, socket.id)
      console.log(`Socket updated for user ${userId} with socket id ${socket.id}`)
    } catch (err) {
      console.error("Authentication failed:", err.message)
    }
  })
})

server.listen(port, () => {
  console.log(`Visioconf app listening on port ${port}`)
})
app.use(cors())
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

var verbose = process.env.VERBOSE === "true"
var controleur = new Controleur()
controleur.verboseall = verbose

// Instanciation des services pour les initialiser et déclencher leur enregistrement auprès du contrôleur
new UsersService(controleur, "UsersService")
new MessagesService(controleur, "MessagesService")
new RolesService(controleur, "RolesService")
new PermsService(controleur, "PermsService")
new CanalSocketio(io, controleur, "canalsocketio")
new AwsS3Service(controleur, "AwsS3Service")
new FileService(controleur, "FileService")
new ChannelsService(controleur, "ChannelService")
new TeamsService(controleur, "TeamsService")

main().catch((err) => console.error("Error during startup:", err))

// Modifier la fonction main() pour inclure l'option d'initialisation de la base de données
async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  })

  // Vérifier si l'initialisation de la base de données est demandée
  if (process.env.INIT_DB === "true") {
    console.log("Initialisation de la base de données...")
    try {
      const result = await initDb(mongoose)
      if (result.success) {
        console.log("Initialisation de la base de données réussie")
      } else {
        console.error("Échec de l'initialisation de la base de données:", result.error)
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation de la base de données:", err)
    }
  }
}
