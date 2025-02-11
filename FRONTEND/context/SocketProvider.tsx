"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Controleur from "@/controllers/controleur";
import { CanalSocketio } from "@/controllers/canalsocketio";

// ✅ Définition du type correct pour le contexte
interface SocketContextType {
    controleur: Controleur | null;
    canal: CanalSocketio | null;
}

// ✅ Créer le contexte avec une valeur initiale `null`
const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [controleur, setControleur] = useState<Controleur | null>(null);
    const [canal, setCanal] = useState<CanalSocketio | null>(null);

    useEffect(() => {
        const newControleur = new Controleur();
        const newCanal = new CanalSocketio(newControleur, "CanalGlobal");

        setControleur(newControleur);
        setCanal(newCanal);

        return () => {
            newCanal.socket.disconnect(); // Déconnexion WebSocket lors du démontage
        };
    }, []);

    return (
        <SocketContext.Provider value={{ controleur, canal }}>
            {children}
        </SocketContext.Provider>
    );
};

// ✅ Hook pour accéder facilement au contexte
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};



// Dans un composant, il suffit d’utiliser useSocket() pour récupérer les messages :
// import { useSocket } from "@/context/SocketProvider";