"use client";
import type React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Controleur from "@/controllers/controleur";
import CanalSocketio from "@/controllers/canalsocketio";
import type { User } from "@/types/User";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";

interface AppContextType {
    controleur: Controleur;
    canal: CanalSocketio;
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const router = useRouter();
    const pathname = usePathname();

    const controleurRef = useRef<Controleur>(null);
    const canalRef = useRef<CanalSocketio>(null);

    if (!controleurRef.current) {
        controleurRef.current = new Controleur();
    }
    if (!canalRef.current) {
        canalRef.current = new CanalSocketio(
            controleurRef.current,
            "CanalGlobal"
        );
    }

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const nomDInstance = "AppContextProvider";
    const verbose = false;
    const listeMessageEmis = ["user_info_request"];
    const listeMessageRecus = ["user_info_response"];
    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            user_info_response?: {
                etat: boolean;
                userInfo?: User;
                error?: string;
            };
        }) => {
            if (verbose)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                );
            if (msg.user_info_response) {
                if (!msg.user_info_response.etat) {
                    console.log(
                        "Failed to fetch user info: ",
                        msg.user_info_response.error
                    );
                } else {
                    setCurrentUser(msg.user_info_response.userInfo || null);
                }
            }
        },
    };

    // Fonction de déconnexion centralisée
    const logout = () => {
        // Supprimer le token des cookies
        Cookies.remove("token", { path: "/" });

        // Supprimer le token du localStorage
        try {
            localStorage.removeItem("auth_token");
        } catch (e) {
            console.error(
                "Erreur lors de la suppression du token du localStorage:",
                e
            );
        }

        // Déconnecter le socket si nécessaire
        if (canalRef.current?.socket) {
            canalRef.current.socket.emit("logout");
            canalRef.current.socket.disconnect();
        }

        // Réinitialiser l'état utilisateur
        setCurrentUser(null);

        // Rediriger vers la page de login
        router.push("/login");
    };

    useEffect(() => {
        controleurRef.current?.inscription(
            handler,
            listeMessageEmis,
            listeMessageRecus
        );
        return () => {
            controleurRef.current?.desincription(
                handler,
                listeMessageEmis,
                listeMessageRecus
            );
        };
    }, []);

    useEffect(() => {
        // Vérifier à la fois les cookies et localStorage
        const tokenFromCookie = Cookies.get("token");
        const tokenFromStorage = localStorage.getItem("auth_token");
        const hasToken = tokenFromCookie || tokenFromStorage;

        // Si aucun token n'est trouvé et que l'utilisateur n'est pas sur une page publique
        if (!hasToken && pathname !== "/login" && pathname !== "/signup") {
            console.log("Aucun token trouvé, redirection vers login");
            setCurrentUser(null);
            router.push("/login");
        }
    }, [currentUser, pathname]);

    useEffect(() => {
        if (!currentUser) {
            // Récupérer le token depuis les cookies ou localStorage
            const token =
                Cookies.get("token") || localStorage.getItem("auth_token");

            if (token) {
                try {
                    const decoded = jwt.decode(token) as any;
                    if (!decoded || !decoded.userId) {
                        console.error("Token invalide");
                        Cookies.remove("token");
                        localStorage.removeItem("auth_token");
                        return;
                    }

                    const { userId } = decoded;

                    // Synchroniser les méthodes de stockage
                    if (
                        !Cookies.get("token") &&
                        localStorage.getItem("auth_token")
                    ) {
                        Cookies.set("token", token, {
                            secure: window.location.protocol === "https:",
                            sameSite: "lax",
                            expires: 7,
                            path: "/",
                        });
                    } else if (
                        Cookies.get("token") &&
                        !localStorage.getItem("auth_token")
                    ) {
                        try {
                            localStorage.setItem("auth_token", token);
                        } catch (e) {
                            console.error(
                                "Impossible de stocker le token dans localStorage",
                                e
                            );
                        }
                    }

                    const waitForCanalInit = () =>
                        new Promise<void>((resolve) => {
                            const interval = setInterval(() => {
                                if (
                                    canalRef.current?.listeDesMessagesRecus
                                        ?.length
                                ) {
                                    clearInterval(interval);
                                    resolve();
                                }
                            }, 100);
                        });

                    waitForCanalInit().then(() => {
                        controleurRef.current?.envoie(handler, {
                            user_info_request: { userId },
                        });
                        canalRef.current?.socket.emit("authenticate", token);
                    });
                } catch (error) {
                    console.error("Erreur lors du décodage du token:", error);
                    Cookies.remove("token");
                    localStorage.removeItem("auth_token");
                }
            }
        }
    }, [currentUser, pathname]);

    return (
        <AppContext.Provider
            value={{
                controleur: controleurRef.current,
                canal: canalRef.current,
                currentUser,
                setCurrentUser,
                logout,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error("useApp must be used within an AppContextProvider");
    return context;
};
