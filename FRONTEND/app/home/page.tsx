"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./home.module.css";
import { useAppContext } from "@/context/AppContext";
import UsersList from "@/components/UsersList";
import { User } from "@/types/User";
import { Bell, Clock } from "lucide-react";
import UsersListMessage from "@/components/UsersListMessage";
import UsersListCall from "@/components/UsersListCall";
import { Message } from "@/types/Message";
import { Call } from "@/types/Call";

export default function HomePage() {
  const pathname = usePathname();
  const { controleur, canal, currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);

  const nomDInstance = "HomePage";
  const verbose = false;

  const listeMessageEmis = [
    "users_list_request",
    "messages_get_request",
    "calls_get_request",
  ];

  const listeMessageRecus = [
    "users_list_response",
    "messages_get_response",
    "calls_get_response",
  ];

  const handler = {
    nomDInstance,
    traitementMessage: (msg: {
      users_list_response?: {
        etat: boolean;
        users?: User[];
        error?: string;
      };
      messages_get_response?: {
        etat: boolean;
        messages?: Message[];
        error?: string;
      };
      calls_get_response?: {
        etat: boolean;
        calls?: Call[];
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

      if (msg.messages_get_response) {
        if (!msg.messages_get_response.etat) {
          console.error(
            `Erreur lors de la récupération des messages: ${msg.messages_get_response.error}`
          );
        } else {
          setMessages(msg.messages_get_response.messages || []);
        }
      }

      if (msg.calls_get_response) {
        if (!msg.calls_get_response.etat) {
          console.error(
            `Erreur lors de la récupération des appels: ${msg.calls_get_response.error}`
          );
        } else {
          setCalls(msg.calls_get_response.calls || []);
        }
      }
    },
  };

  const fetchMessagesList = () => {
    try {
      if (controleur) {
        const T = { messages_get_request: {} };
        controleur.envoie(handler, T);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des messages.", err);
    }
  };

  const fetchCallsList = () => {
    try {
      if (controleur) {
        const T = { calls_get_request: {} };
        controleur.envoie(handler, T);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des appels.", err);
    }
  };

  useEffect(() => {
    if (controleur && canal) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
      fetchUsersList();
      fetchMessagesList();
      fetchCallsList();
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

  // Compter le nombre d'appels non manqués
  const completedCallsCount = calls.filter(
    (call) => call.call_type !== "missed"
  ).length;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>Boite de réception</h1>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.reception}>
            <div className={styles.reception_header}>
              <Bell />
              {messages.length === 0 ? (
                <h3>Vous avez aucune notification</h3>
              ) : (
                <h3>{messages.length} messages en attente</h3>
              )}
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
              <h3>
                {calls.length === 0
                  ? "Aucun appel récent"
                  : `${completedCallsCount} appels récents`}
              </h3>
            </div>
            <UsersListCall
              users={users}
              calls={calls}
              currentUserEmail={currentUser?.email || ""}
              isLoading={isLoading}
              limitCalls={5} // Afficher seulement les 5 derniers appels
            />
          </div>
        </section>
      </main>
    </div>
  );
}
