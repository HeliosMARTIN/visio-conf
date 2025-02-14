/*Author : Matthieu BIVILLE*/

import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import styles from "./RoleDisplay.module.css"
import router from "next/router";
import { InputAdornment, TextField, Typography } from "@mui/material";
import { Pencil, Search, Trash2 } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { Role } from "@/types/Role";

export default function RoleListDisplay () {
    const [regex, setRegex] = useState<string>("");
    const [roleList, setRoleList] = useState<Role[]>();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [rows, setRows] = useState<any>();

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

    useEffect(() => {
        setRows([]);
        const newRows : any = [];
        roleList?.map((role, index) => {
            if(role.role_label.includes(regex)){
                newRows.push({
                    id : role._id,
                    name : role.role_label,
                    action : "",
                    isEven: index%2 == 0
                })
            }
        })
        setRows(newRows);
    }, [roleList, regex])

    const columns = [
        { 
            field: 'name', 
            headerName: 'Name', 
            flex: 4,
            renderCell: (params : any) => (
                <div className={styles.rowLabel}>
                    {params.value}
                </div>
            )
        },
        { 
            field: 'action', 
            headerName: 'Action', 
            flex: 1,
            renderCell: (params : any) => (
                <div className={styles.rowIcons}>
                    <div style={{backgroundColor: "#223A6A"}} className={styles.iconContainer}>
                        <Pencil size={22} color="white" />
                    </div>
                    <div style={{backgroundColor: "#CB0000"}} className={styles.iconContainer}>
                        <Trash2 size={22} color="white" />
                    </div>
                </div>
            )
        },
    ];
      

    return (
        <div className={styles.container}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <div style={{display : "flex", alignItems : "center", columnGap: "20px"}}>
                    <img src="./icons/User_Friend.svg" alt="" className={styles.icon}/>
                    <Typography variant="subtitle1" className={styles.title}>Liste des rôles</Typography>
                </div>
                <button className={styles.addButton}>+ Ajouter</button>
            </div>
            <TextField 
                id="regex"
                type="text"
                name="regex"
                placeholder="Rechercher un rôle"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                className={styles.search}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <Search size={20} color="gray" />
                    </InputAdornment>
                    )
                }}
            />
            <DataGrid 
                rows={rows} 
                columns={columns} 
                rowHeight={69}
                getRowId={(row) => row.id}
                columnHeaderHeight={69}
                className={styles.table}
                autoPageSize
                sx={{  
                    '.MuiDataGrid-columnHeaderTitle': {
                        paddingInline: '38px',
                        color:"#223A6A",
                        fontFamily: "Arial",
                        fontSize: "20px",
                        fontStyle: "normal",
                        fontWeight: 700,
                        lineHeight: "normal"
                    },
                    '& .MuiDataGrid-cell': {
                        paddingInline: '38px',
                    },
                }}
            />
        </div>
    )
}