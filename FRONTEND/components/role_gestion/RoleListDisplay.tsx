/*Author : Matthieu BIVILLE*/

import { useAppContext } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import styles from "./RoleDisplay.module.css"
import router from "next/router";

export default function RoleListDisplay () {
    const [regex, setRegex] = useState<string>("");
    const [roleList, setRoleList] = useState<any>();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");

    const nomDInstance = "Home Role Gestion"
    const verbose = false
    const { controleur, canal, currentUser, setCurrentUser } = useAppContext()
    const listeMessageEmis = ["roles_list_request"]
    const listeMessageRecus = ["roles_list_response"]

    const handler = {
            nomDInstance,
            traitementMessage: (msg: {
                roles_list_response?: any
            }) => {
                if (verbose || controleur?.verboseall)
                    console.log(
                        `INFO: (${nomDInstance}) - traitementMessage - `,
                        msg
                    )
                if (msg.roles_list_response) {
                    setRoleList(msg.roles_list_response)
                }
            },
        }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        }
        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [router, controleur, canal])

    useEffect(() => {
        controleur.envoie(handler, {
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