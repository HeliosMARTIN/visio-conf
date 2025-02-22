/* Authors: Matthieu BIVILLE */

import Perm from "../models/permission.js"
import { v4 as uuidv4 } from "uuid"

class PermsService{
    controleur;
    verbose=false;
    listeDesMessagesEmis=[
        "perms_list_response",
    ];
    listeDesMessagesRecus=[
        "perms_list_request",
    ];
    
    constructor(c,nom){
        this.controleur=c;
        this.nomDInstance=nom;
        if(this.controleur.verboseall || this.verbose) console.log("INFO ("+this.nomDInstance+"):  s'enregistre aupres du controleur");
        this.controleur.inscription(this,this.listeDesMessagesEmis, this.listeDesMessagesRecus);
    }
    
    async traitementMessage(mesg){
        if(this.controleur.verboseall || this.verbose){
             console.log("INFO ("+this.nomDInstance+"): reçoit le message suivant à traiter");
             console.log(mesg);
        }
    
        if(typeof mesg.perms_list_request != "undefined"){
            var perms = await Perm.find().sort();
            this.controleur.envoie(this, {
                "perms_list_response" : perms,
                id : [mesg.id]
            });
        }
    }
}
export default PermsService
