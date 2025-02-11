class ConnexionUtilisateur {
    controleur
    nomDInstance
    support

    listeDesMessagesEmis = new Array("demande_de_connexion")
    listeDesMessagesRecus = new Array("vous_etes_connecte")
    verbose = false

    constructor(s, c, nom) {
        this.controleur = c
        this.support = s
        this.nomDInstance = nom
        if (this.controleur.verboseall || this.verbose)
            console.log(
                " INFO (" +
                    this.nomDInstance +
                    "): inscription des messages de Login"
            )
        c.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        )
        this.affiche()
    }

    affiche() {
        var contenu = `
			<div>
				Login: <input type="text" class="login_input">
				mdp: <input type="text" class="login_input">
				<button class="login_ok">OK</button>
			</div>
		`

        this.support.innerHTML = contenu
        this.support.getElementsByClassName("login_ok")[0].addEventListener(
            "click",
            (e) => {
                let T = new Object()
                T.demande_de_connexion = new Object()
                T.demande_de_connexion.login =
                    this.support.getElementsByClassName("login_input")[0].value
                T.demande_de_connexion.mdp =
                    this.support.getElementsByClassName("login_input")[1].value
                this.controleur.envoie(this, T)
            },
            false
        )
    }

    traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): on reçoit: " +
                    JSON.stringify(mesg)
            )
        if (typeof mesg["vous_etes_connecte"] != "undefined") {
            if (mesg["vous_etes_connecte"].etat == "false") {
                if (this.controleur.verboseall || this.verbose)
                    console.log(
                        "ERREUR (" +
                            this.nomDInstance +
                            "): état de la connexion utilisateur FALSE"
                    )
            } else {
                this.afficheUser(mesg.vous_etes_connecte.user)
            }
        }
    }

    afficheUser(user) {
        var contenu = `
            <div>
                Connexion réussie! Bonjour ${user.firstname} ${user.lastname} ! 
            </div>
        `
        this.support.innerHTML = contenu
    }
}
