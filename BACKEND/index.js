const express = require("express")
    const app = express()
    var cors = require("cors")
    const path = require("path")
    const port = 3220
    const server = require("http").createServer(app)
    const io = require("socket.io")(server, { cors: { origin: "*" } })
    const mongoose = require("mongoose")

    const Controleur = require("./controleur.js")
    const CanalSocketio = require("./canalsocketio.js")
    const GestionUtilisateur = require("./gestion_utilisateur/gestion_utilisateur.js")
    /*
    const Login=require('./login/login.js');
    const Moteur=require('./moteur/moteur.js');
    const Chat=require('./chat/chat.js');
    */

    server.listen(port, () => {
        console.log(`Visioconf app listening on port ${port}`)
    })
    app.use(cors())
    app.use(express.static(path.join(__dirname, "public")))

    var verbose = true
    var controleur = new Controleur()
    controleur.verboseall = true

    var canalsocketio = new CanalSocketio(io, controleur, "canalsocketio")
    var gestionUtilisateur = new GestionUtilisateur(
        controleur,
        "gestion_utilisateur"
    )

    main().catch((err) => console.log(err))
    
    async function main() {
        await mongoose.connect(
            "mongodb://visio-conf-user:visio-conf-password@127.0.0.1:27017/visio-conf?authSource=visio-conf"
        )
    }
