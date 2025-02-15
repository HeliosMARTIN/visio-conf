/*Author : Matthieu BIVILLE*/

import { selectClasses, Typography } from "@mui/material"
import styles from "./AdminMenu.module.css"
import { Drama, ListChecks, MessagesSquare, PhoneCall, UserRound, UsersRound } from "lucide-react"

export default function AdminMenu({
    selectedTab,
    setSelectedTab
} : {
    selectedTab: string,
    setSelectedTab : Function
}) {
    const tabs = [
        {
            name : "Utilisateurs", 
            icon : <UsersRound size={40} />, 
            subOption : ["Lister", "Modifier", "Valider", "Désactiver", "Bannir"], 
            click : () => setSelectedTab("Utilisateurs")
        },
        {
            name : "Rôles", 
            icon : <Drama size={40} />, 
            subOption : ["Lister", "Créer", "Dupliquer", "Modifier", "Supprimer"],
            click : () => setSelectedTab("Rôles")
        },
        {
            name : "Permissions", 
            icon : <ListChecks size={40} />, 
            subOption : ["Lister"],
            click : () => setSelectedTab("Permissions")
        },
        {
            name : "Groupes", 
            icon : <MessagesSquare size={40} />, 
            subOption : ["Lister", "Créer", "Modifier", "Supprimer"],
            click : () => setSelectedTab("Groupes")
        },
    ]

    return(
        <div className={styles.container}>
            <Typography className={styles.title}>Administration</Typography>
            {
                tabs.map((tab, index) => {
                    return(
                        <div 
                            key={index} 
                            className={styles.tab}
                            style={{
                                backgroundColor: selectedTab === tab.name ? "#80A7E1" : "#EDEDED",
                                color : selectedTab === tab.name ? "white" : "#223A6A"
                            }}
                            onClick={tab.click}
                        >
                            <div className={styles.tabText}>
                                <p style={{fontSize: "24px", fontWeight: 700, marginBottom: "15px"}}>{tab.name}</p>
                                <div className={styles.tabOption}>
                                    {tab.subOption.map((option, index) => {
                                        return (
                                            <p key={index} className={styles.option}>{option}</p>
                                        )
                                    })}
                                </div>
                            </div>                            
                            {tab.icon}
                        </div>
                    )
                })
            }
        </div>
    )
}