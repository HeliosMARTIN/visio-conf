const Controleur = require("./controleur")

let controleurInstance

function getControleurInstance() {
    if (!controleurInstance) {
        controleurInstance = new Controleur()
    }
    return controleurInstance
}

module.exports = getControleurInstance
