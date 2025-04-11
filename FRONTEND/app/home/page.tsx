"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./home.module.css";
import { useAppContext } from "@/context/AppContext";
import UsersList from "@/components/UsersList";
import { User } from "@/types/User";
import { Bell, Clock } from "lucide-react";
import UsersListMessage from "@/components/UsersListMessage";
import { Message } from "@/types/Message";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { controleur, canal, currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const nomDInstance = "HomePage";
  const verbose = false;

  const listeMessageEmis = ["users_list_request", "messages_list_request"];
  const listeMessageRecus = ["users_list_response", "messages_list_response"];

  const handler = {
    nomDInstance,
    traitementMessage: (msg: {
      users_list_response?: {
        etat: boolean;
        users?: User[];
        error?: string;
      };
      messages_list_response?: {
        etat: boolean;
        messages?: Message[];
        error?: string;
      };
    }) => {
      if (verbose || controleur?.verboseall) {
        console.log(`INFO: (${nomDInstance}) - traitementMessage - `, msg);
      }

      if (msg.users_list_response) {
        setIsLoading(false);
        if (!msg.users_list_response.etat) {
          setError(
            `Erreur lors de la récupération des utilisateurs: ${msg.users_list_response.error}`
          );
        } else {
          setUsers(msg.users_list_response.users || []);
        }
      }

      if (msg.messages_list_response) {
        if (!msg.messages_list_response.etat) {
          console.error(
            `Erreur lors de la récupération des messages: ${msg.messages_list_response.error}`
          );
        } else {
          setMessages(msg.messages_list_response.messages || []);
        }
      }
    },
  };

  const fetchMessagesList = () => {
    try {
      if (controleur) {
        const T = { messages_list_request: {} };
        controleur.envoie(handler, T);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des messages.", err);
    }
  };

  useEffect(() => {
    // Inscription au contrôleur pour recevoir les messages
    if (controleur && canal) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
      fetchUsersList();
      fetchMessagesList(); // Ajouter cette ligne pour récupérer les messages
    }

    return () => {
      if (controleur) {
        controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
      }
    };
  }, [pathname, controleur, canal, currentUser]);

  const fetchUsersList = () => {
    try {
      if (controleur) {
        const T = { users_list_request: {} };
        controleur.envoie(handler, T);
      }
    } catch (err) {
      setError(
        "Erreur lors de la récupération des utilisateurs. Veuillez réessayer."
      );
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (!currentUser) return <div>Veuillez vous connecter</div>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>Boite de réception</h1>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.reception}>
            <div className={styles.reception_header}>
              <Bell />
              <h3>{messages.length} nouvelles notifications non lues.</h3>
            </div>
            <UsersListMessage
              users={users}
              messages={messages}
              currentUserEmail={currentUser?.email || ""}
              isLoading={isLoading}
            />
          </div>
        </section>
        <section className={styles.section}>
          <h1>Historique d'appels</h1>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.reception}>
            <div className={styles.reception_header}>
              <Clock />
              <h3>{users.length - 1} appel passé.</h3>
            </div>
            <UsersList
              users={users}
              currentUserEmail={currentUser?.email || ""}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
