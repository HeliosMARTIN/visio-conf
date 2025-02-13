/*Author : Matthieu BIVILLE*/

import { useSocket } from "@/context/SocketProvider";
import { useEffect, useRef, useState } from "react";
import styles from "./RoleDisplay.module.css"

export default function RoleListDisplay () {
    const [regex, setRegex] = useState<string>("");
    const [roleList, setRoleList] = useState<any>();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");

    const nomDInstance = "Home Role Gestion"
    const verbose = false
    const { controleur, canal, currentUser, setCurrentUser } = useSocket()
    const listeMessageEmis = ["roles_list_request"]
    const listeMessageRecus = ["roles_list_response"]

    const {current} = useRef({
        nomDInstance,
        traitementMessage: (msg : any) => {
            if (verbose || controleur.verboseall) console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);

            if (typeof msg.roles_list_response !== "undefined") {
                setRoleList(msg.roles_list_response);
            }
        }
    });

    useEffect(() => {
        if (controleur) {
            controleur.inscription(current, listeMessageEmis, listeMessageRecus)
        }
        return () => {
            if (controleur) {
                controleur.desincription(current,listeMessageEmis,listeMessageRecus)
            }
        }
    }, [current])

    useEffect(() => {
        controleur.envoie(current, {
            "roles_list_request" : 1
        })
    }, [])

    return (
        <div className={styles.container}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <h1>Liste des rôles</h1>
                <button>+ Ajouter</button>
            </div>
            <input
                type="text"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Action</td>
                    </tr>
                </thead>
                <tbody>
                    
                </tbody>
            </table>
        </div>
    )
}