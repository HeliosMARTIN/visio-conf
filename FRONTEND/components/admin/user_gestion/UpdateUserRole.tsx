/*Author : Matthieu BIVILLE*/

import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import styles from "./UpdateUserRole.module.css"
import router from "next/router";
import { TextField, Typography } from "@mui/material";
import CustomSnackBar from "../../SnackBar";
import { Check, ChevronDown, ChevronUp, X} from "lucide-react";
import { Role } from "@/types/Role";

export default function UpdateUserRole ({
    user,
    setUpdateUser
} : {
    user: any,
    setUpdateUser : Function
}) {
    const [userName, setUserName] = useState<string | undefined>("");
    const [roleList, setRoleList] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [openDropDown, setOpenDropDown] = useState<boolean>(true);

    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [alertSeverity, setAlertSeverity] = useState<"success" | "error" | "warning" | "info">("success");
    const [alertMessage, setAlertMessage] = useState<string>("");

    const nomDInstance = "Update User Role"
    const verbose = false
    const { controleur, canal, currentUser, setCurrentUser } = useAppContext()
    const listeMessageEmis = [
        "roles_list_request",
        "update_user_roles_request"
    ]
    const listeMessageRecus = [
        "roles_list_response",
        "update_user_roles_response"
    ]

    const handler = {
            nomDInstance,
            traitementMessage: (msg: {
                roles_list_response?: any,
                update_user_roles_response?: any
            }) => {
                if (verbose || controleur?.verboseall)
                    console.log(`INFO: (${nomDInstance}) - traitementMessage - `,msg)
                if (msg.roles_list_response) {
                    setRoleList(msg.roles_list_response)
                }
                if (msg.update_user_roles_response) {
                    setUpdateUser(false);
                }
            },
        }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        }
        return () => {
            if (controleur) {
                controleur.desincription(handler,listeMessageEmis,listeMessageRecus)
            }
        }
    }, [router, controleur, canal])

    useEffect(() => {
        controleur.envoie(handler, {
            "roles_list_request" : 1
        })
    }, [])

    useEffect(() => {
        if(user){
            setUserName(user.firstname + " " + user.lastname);
            setSelectedRoles(user.roles);
        }
    }, [user])

    const handleUpdateUser = () => {
        controleur.envoie(handler, {
            "update_user_roles_request" : {
                user_id : user.id,
                roles: selectedRoles
            }
        })
    }

    const handleCheckboxChange = (role : Role) => {
        setSelectedRoles((prevRoles) => {
            const isSelected = prevRoles?.some(roleId => roleId === role._id);

            if (isSelected) {
                return prevRoles?.filter(roleId => roleId !== role._id);
            } else {
                return [...prevRoles, role._id];
            }
        });
    };
      

    return (
        <div className={styles.container}>
            <div style={{display: "flex", justifyContent: "left"}}>
                <div style={{display : "flex", alignItems : "center", columnGap: "20px"}}>
                    <img src="/icons/User_Friend.svg" alt="" className={styles.icon}/>
                    <Typography variant="subtitle1" className={styles.title}>
                        Modifier les rôles d'un utilisateur
                    </Typography>
                </div>
            </div>
            <div style={{display: "flex", justifyContent: "center"}}>
                <p className={styles.name}>Utilisateur "{userName}"</p>
            </div>
            <div className={styles.perms}>
                <div className={styles.dropDown}>
                    <p className={styles.addPerm} onClick={() => setOpenDropDown(!openDropDown)}>
                        Ajouter des rôles
                        {openDropDown ? 
                            <ChevronUp size={30} color="#223A6A"/> : 
                            <ChevronDown size={30} color="#223A6A"/>
                        }
                    </p>
                    {openDropDown && <div style={{overflowY: "auto", scrollbarWidth: "thin", height: "calc(100% - 58px)"}}>
                        {
                            roleList?.map((role, index) => {
                                return (
                                    <p 
                                        style={{backgroundColor: index%2 ? "#EAEAEA" : "white"}}
                                        className={styles.option}
                                        key={role._id}
                                    >
                                        {role.role_label}
                                        <input 
                                            type="checkbox" 
                                            name="" 
                                            id="" 
                                            style={{width: "25px", height:"25px"}}
                                            onChange={() => handleCheckboxChange(role)}
                                            checked={selectedRoles?.includes(role._id)}
                                        />
                                    </p>
                                )
                            })
                        }
                    </div>}
                </div>
                <div className={styles.dropDown}>
                    <p className={styles.addPerm}>
                        Rôles sélectionnés 
                        <Check size={30} color="#223A6A"/>
                    </p>
                    <div style={{overflowY: "auto", scrollbarWidth: "thin", height: "calc(100% - 58px)"}}>
                    {
                            roleList?.map((role, index) => {
                                if(selectedRoles?.includes(role._id)){
                                    return (
                                        <p 
                                            key={role._id}
                                            style={{backgroundColor: index%2 ? "#EAEAEA" : "white"}}
                                            className={styles.option}
                                        >
                                            {role.role_label}
                                        </p>
                                    )
                                }
                            })
                        }
                    </div>
                </div>
            </div>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <button 
                    onClick={() => setUpdateUser(false)}
                    className={styles.button}
                    style={{background : "red"}}
                ><X size={26} color="white"/> Annuler</button>
                <button 
                    onClick={handleUpdateUser}
                    className={styles.button}
                    style={{background : "#223A6A"}}
                ><Check size={26} color="white"/> Valider</button>
            </div>
            <CustomSnackBar
                open={openAlert}
                setOpen={setOpenAlert}
                msg={alertMessage}
                severity={alertSeverity}
            />
        </div>
    )
}