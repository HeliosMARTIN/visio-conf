"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import styles from "./home.module.css"
import jwt from "jsonwebtoken"
import { useAppContext } from "@/context/AppContext"
import { Bell } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import Image from "next/image"
import { User } from "@/types/User"

export default function HomePage() {
    const router = useRouter();
    const { currentUser } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        } else {
            setIsLoading(false);
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const filteredUsers = data.filter((user: User) => user.id !== currentUser.id);
                setUsers(filteredUsers);
            } else {
                console.error('Erreur lors de la récupération des utilisateurs');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Chargement...</div>;
    if (!currentUser) return <div>Veuillez vous connecter</div>;

    const handleMessage = (userId: string) => {
        router.push(`/message?id=${userId}`)
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.section}>
                    <h1>Liste des utilisateurs</h1>
                    <div className={styles.reception}>
                        <div className={styles.reception_header}>
                            <Bell />
                            <h3>Utilisateurs disponibles ({users.length})</h3>
                        </div>
                        <div className={styles.reception_body}>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <div key={user.id} className={styles.reception_body_item}>
                                        <Image
                                            src={`https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`}
                                            alt={`${user.firstname} profile picture`}
                                            width={50}
                                            height={50}
                                            unoptimized
                                            className={styles.userImage}
                                        />
                                        <div>
                                            <h3>{user.firstname} {user.lastname}</h3>
                                            <p>{user.email}</p>
                                        </div>
                                        <ChevronRight 
                                            onClick={() => handleMessage(user.id)} 
                                            style={{ cursor: 'pointer' }} 
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className={styles.reception_body_item}>
                                    <p>Aucun autre utilisateur disponible</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section>
                    <h1>Historique d'appels</h1>
                </section>
            </main>
        </div>
    )
}