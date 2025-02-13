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

dotenv.config()

// Pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3220
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

server.listen(port, () => {
    console.log(`Visioconf app listening on port ${port}`)
})
app.use(cors())
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

app.use((req, res, next) => {
    const token = req.headers["authorization"]
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" })
            } else {
                req.user = decoded
                next()
            }
        })
    } else {
        next()
    }
})

    var verbose = true
    var controleur = new Controleur()
    controleur.verboseall = true

// Instanciation des services pour les initialiser et déclencher leur enregistrement auprès du contrôleur
const usersService = new UsersService(controleur, "UsersService")
const messagesService = new MessagesService(controleur, "MessagesService")

const canalsocketio = new CanalSocketio(io, controleur, "canalsocketio")

    main().catch((err) => console.log(err))

    async function main() {
        await mongoose.connect(
            "mongodb://visio-conf-user:visio-conf-password@127.0.0.1:27017/visio-conf?authSource=visio-conf"
        )
    }
