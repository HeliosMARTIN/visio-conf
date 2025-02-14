import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import CanalSocketio from "./canalsocketio.js";
import Controleur from "./controleur.js";
import UsersService from "./services/Users.js";
import MessagesService from "./services/Messages.js";
import AwsS3Service from "./services/AwsS3Service.js";
import RolesService from "./services/Roles.js";
import PermsService from "./services/Perms.js";
import SocketIdentificationService from "./services/SocketIdentification.js";

dotenv.config();

// Pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3220;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(port, () => {
  console.log(`Visioconf app listening on port ${port}`);
});
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

var verbose = process.env.VERBOSE === "true";
var controleur = new Controleur();
controleur.verboseall = verbose;

// Instanciation des services pour les initialiser et déclencher leur enregistrement auprès du contrôleur
const usersService = new UsersService(controleur, "UsersService");
const messagesService = new MessagesService(controleur, "MessagesService");
const rolesService = new RolesService(controleur, "RolesService");
const permsService = new PermsService(controleur, "PermsService");
const canalsocketio = new CanalSocketio(io, controleur, "canalsocketio");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
  });
}
