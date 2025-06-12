"use client";
import type React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Controleur from "@/controllers/controleur";
import CanalSocketio from "@/controllers/canalsocketio";
import type { User } from "@/types/User";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import { NotificationProvider } from "./NotificationContext";

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

                    // Si l'erreur indique que l'authentification est requise, logout automatique
                    if (
                        msg.user_info_response.error ===
                        "AUTHENTICATION_REQUIRED"
                    ) {
                        console.log("Authentication required, logging out...");
                        // Nettoyer les données
                        Cookies.remove("token");
                        localStorage.removeItem("auth_token");
                        setCurrentUser(null);
                        // Rediriger vers login
                        router.push("/login");
                    }
                } else {
                    setCurrentUser(msg.user_info_response.userInfo || null);
                }
            }
        },
    };

    // Inscription au contrôleur
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

    // Redirection si pas de token
    useEffect(() => {
        const tokenFromCookie = Cookies.get("token");
        const tokenFromStorage = localStorage.getItem("auth_token");
        const hasToken = tokenFromCookie || tokenFromStorage;

        if (!hasToken && pathname !== "/login" && pathname !== "/signup") {
            setCurrentUser(null);
            router.push("/login");
        }
    }, [currentUser, pathname]);

    // Récupération des infos utilisateur
    useEffect(() => {
        if (!currentUser) {
            const token =
                Cookies.get("token") || localStorage.getItem("auth_token");

            if (token) {
                const decoded = jwt.decode(token) as any;
                const { userId } = decoded;

                // Fonction simple pour attendre la connexion et envoyer la requête
                const sendUserInfoRequest = async () => {
                    if (canalRef.current?.socket && controleurRef.current) {
                        try {
                            // Attendre que le socket soit connecté
                            if (!canalRef.current.socket.connected) {
                                await new Promise<void>((resolve) => {
                                    const checkConnection = () => {
                                        if (
                                            canalRef.current?.socket?.connected
                                        ) {
                                            resolve();
                                        } else {
                                            setTimeout(checkConnection, 100);
                                        }
                                    };
                                    checkConnection();
                                });
                            }

                            // Utiliser la nouvelle méthode d'authentification
                            await canalRef.current.authenticate(token);

                            // Ensuite récupérer les infos utilisateur
                            controleurRef.current.envoie(handler, {
                                user_info_request: { userId },
                            });

                            console.log(
                                "Socket authentifié et requête user_info envoyée"
                            );
                        } catch (error) {
                            console.error(
                                "Erreur lors de l'authentification:",
                                error
                            );
                            // En cas d'échec, déconnecter et nettoyer
                            if (
                                error.message !==
                                "Authentication already in progress"
                            ) {
                                canalRef.current.socket.disconnect();
                                Cookies.remove("token");
                                localStorage.removeItem("auth_token");
                                setCurrentUser(null);
                                router.push("/login");
                            }
                        }
                    } else {
                        // Réessayer dans 200ms
                        setTimeout(sendUserInfoRequest, 200);
                    }
                };

                // Démarrer la tentative
                sendUserInfoRequest();
            }
        }
    }, [currentUser, pathname]);

    // Gestion de la connexion pour login/signup
    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            if (
                canalRef.current?.socket &&
                !canalRef.current.socket.connected
            ) {
                canalRef.current.socket.connect();
            }
        }
    }, [pathname]);

    // Gestion de la reconnexion automatique
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                const token =
                    Cookies.get("token") || localStorage.getItem("auth_token");
                if (
                    token &&
                    canalRef.current?.socket &&
                    !canalRef.current.socket.connected
                ) {
                    console.log(
                        "Tentative de reconnexion après retour à l'onglet"
                    );
                    canalRef.current.socket.connect();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const logout = () => {
        // Déconnecter le socket
        if (canalRef.current?.socket?.connected) {
            canalRef.current.socket.disconnect();
        }

        // Nettoyer les données
        Cookies.remove("token");
        localStorage.removeItem("auth_token");
        setCurrentUser(null);

        // Rediriger
        router.push("/login");
    };

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
            <NotificationProvider>{children}</NotificationProvider>
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error("useApp must be used within an AppContextProvider");
    return context;
};
