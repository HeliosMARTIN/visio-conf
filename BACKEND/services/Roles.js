/* Authors: Matthieu BIVILLE */

const Role = require('../modeles/role');
import { v4 as uuidv4 } from "uuid"

class RolesService{
    controleur;
    verbose=false;
    listeDesMessagesEmis=[
        "roles_list_response",
        "created_role", 
        "role_already_exist",
        "updated_role",
        "deleted_role"
    ];
    listeDesMessagesRecus=[
        "roles_list_request",
        "create_role_request",
        "update_role_request",
        "delete_role_request"
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
        
        if(typeof mesg.create_role_request != "undefined"){
            var role = await Role.findOne({ label: mesg.create_role_request.name });
            if(role == null) {
                var newRole = new Role({
                    label: mesg.create_role_request.name,
                    perms: []
                })
                var r = await newRole.save();
                if(r != null){
                    this.controleur.envoie(this, {"created_role" : {"role_id" : r._id, "socket_id" : mesg.id}});	
                }			 
            }
            else{
                this.controleur.envoie(this, {"role_already_exist" : {"role_id" : role._id, "socket_id" : mesg.id}});
            }
        }
        if(typeof mesg.roles_list_request != "undefined"){
            var roles = await Role.find();
            this.controleur.envoie(this, {"roles_list_response" : roles});
        }
        if(typeof mesg.update_role_request != "undefined"){
            await Role.updateOne(
                { _id: mesg.update_role_request.role_id },
                { $set: { "role_permissions": mesg.update_role_request.perms } }
            );;
            this.controleur.envoie(this, {"updated_role" : {state : true}});
        }
        if(typeof mesg.delete_role_request != "undefined"){
			await Role.deleteOne({_id : mesg.delete_role_request.role_id});
            this.controleur.envoie(this, {"deleted_role" : {state : true}});
		}
    }
}
export default RolesService
