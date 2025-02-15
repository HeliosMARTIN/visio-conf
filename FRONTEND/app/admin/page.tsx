/*Author : Matthieu BIVILLE*/

"use client" 

import { Typography } from "@mui/material"
import styles from "./HomeAdmin.module.css"
import { Drama, ListChecks, MessagesSquare, PhoneCall, UserRound, UsersRound } from "lucide-react"
import { useState } from "react"
import AdminMenu from "@/components/admin/AdminMenu";
import AddUpdateRole from "@/components/role_gestion/AddUpdateRole"
import HomeRoleGestion from "@/components/role_gestion/HomeRoleGestion"
import HomeUserGestion from "@/components/user_gestion/HomeUserGestion"

export default function HomeAdmin() {
    const [selectedTab, setSelectedTab] = useState<string>("");
    
    const tabs = [
        {name : "Utilisateurs", icon : <UsersRound size={60} color="#0272DA"/>, color : "#0272DA", click : () => setSelectedTab("Utilisateurs")},
        {name : "Rôles", icon : <Drama size={60} color="#63B367"/>, color : "#63B367", click : () => setSelectedTab("Rôles")},
        {name : "Permissions", icon : <ListChecks size={60} color="#DA1F63"/>, color : "#DA1F63", click : () => setSelectedTab("Permissions")},
        {name : "Groupes", icon : <MessagesSquare size={60} color="#444447"/>, color : "#444447", click : () => setSelectedTab("Groupes")},
    ]

    if(!selectedTab){
        return(
            <div className={styles.container}>
                <Typography className={styles.title}>Administration</Typography>
                <div className={styles.infosContainer}>
                    <div style={{backgroundColor: "#DCFCE7", borderColor: "#47DA60"}} className={styles.infos}>
                        <div style={{backgroundColor: "#47DA60"}} className={styles.icons}>
                            <UserRound size={30} color="white" />
                        </div>
                        <p className={styles.emphasis}>147</p>
                        <p>utilisateurs connectés</p>
                    </div>
                    <div style={{backgroundColor: "#F4E8FF", borderColor: "#BF82FE"}} className={styles.infos}>
                        <div style={{backgroundColor: "#BF82FE"}} className={styles.icons}>
                            <PhoneCall size={30} color="white" />
                        </div>
                        <p className={styles.emphasis}>6</p>
                        <p>appels en cours</p>
                    </div>
                </div>
                <div className={styles.tabsContainer}>
                    {
                        tabs.map((tab, index) => {
                            return(
                                <div 
                                    key={index} 
                                    className={styles.tab} 
                                    style={{borderColor: tab.color}}
                                    onClick={tab.click}
                                >
                                    {tab.name}
                                    {tab.icon}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
    else{
        return(
            <div style={{display: "flex"}}>
                <AdminMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                {selectedTab === "Utilisateurs" && <HomeUserGestion />}
                {selectedTab === "Rôles" && <HomeRoleGestion />}
            </div>
        )
    }
}