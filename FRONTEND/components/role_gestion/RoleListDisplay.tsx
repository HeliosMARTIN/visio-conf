/*Author : Matthieu BIVILLE*/

import styles from "./RoleDisplay.module.css"
import { InputAdornment, TextField, Typography } from "@mui/material";
import { Pencil, Search, Trash2 } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import DeleteRole from "../modals/DeleteRole";
import CustomSnackBar from "../SnackBar";

export default function RoleListDisplay ({
    setAddUpdateRole,
    regex,
    setRegex,
    rows, 
    columns,
    openDelete,
    setOpenDelete,
    selectedRole,
    handleDeleteRole,
    openAlert,
    setOpenAlert
} : {
    setAddUpdateRole : Function,
    regex : string,
    setRegex : Function,
    rows : any, 
    columns : any,
    openDelete : boolean,
    setOpenDelete : Function,
    selectedRole : any,
    handleDeleteRole : any,
    openAlert : boolean,
    setOpenAlert : any
}) {
    return (
        <div className={styles.container}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <div style={{display : "flex", alignItems : "center", columnGap: "20px"}}>
                    <img src="./icons/User_Friend.svg" alt="" className={styles.icon}/>
                    <Typography variant="subtitle1" className={styles.title}>Liste des rôles</Typography>
                </div>
                <button 
                    onClick={() => setAddUpdateRole(true)}
                    className={styles.addButton}
                >+ Ajouter</button>
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
                disableRowSelectionOnClick
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
            <DeleteRole
                openDeleteRole={openDelete}
                setOpenDeleteRole={setOpenDelete}
                roleName={selectedRole?.name}
                handleDeleteRole={handleDeleteRole}
            />
            <CustomSnackBar
                open={openAlert}
                setOpen={setOpenAlert}
                msg="Rôle supprimé avec succès !"
                severity="success"
            />
        </div>
    )
}