"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./home.module.css";
import { useAppContext } from "@/context/AppContext";
import { User } from "@/types/User";
import { Bell, Clock } from "lucide-react";
import UsersListMessage from "@/components/home/UsersListMessage";
import UsersListCall from "@/components/home/UsersListCall";
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

  // Fonctions de récupération des données
  const fetchData = () => {
    if (controleur) {
      const usersRequest = { users_list_request: {} };
      const messagesRequest = { messages_get_request: {} };
      const callsRequest = { calls_get_request: {} };

      controleur.envoie(handler, usersRequest);
      controleur.envoie(handler, messagesRequest);
      controleur.envoie(handler, callsRequest);
    }
  };

  // Simulation de notification de message
  const simulateMessageNotification = () => {
    // Trouver des utilisateurs différents du currentUser
    const availableUsers = users.filter(
      (user) => user.email !== currentUser?.email
    );

    if (availableUsers.length < 1 || !currentUser) {
      console.error(
        "Pas assez d'utilisateurs disponibles pour simuler des messages"
      );
      return;
    }

    // Prendre le premier utilisateur
    const firstUser = availableUsers[0];

    // Créer un message pour le premier utilisateur
    const firstMockMessage: Message = {
      message_uuid: `mock-${Date.now()}-1`,
      message_content: "Bonjour, pouvez-vous m'aider sur un projet ?",
      message_date_create: new Date().toISOString(),
      message_status: "sent",
      message_sender: firstUser,
    };

    // Si on a un deuxième utilisateur disponible
    let secondMockMessage: Message | null = null;

    if (availableUsers.length > 1) {
      const secondUser = availableUsers[1];
      secondMockMessage = {
        message_uuid: `mock-${Date.now()}-2`,
        message_content: "Avez-vous vu ma dernière présentation ?",
        message_date_create: new Date(Date.now() + 1000).toISOString(), // 1 seconde plus tard
        message_status: "sent",
        message_sender: firstUser,
      };
    }

    // Ajouter le(s) message(s) simulé(s) à la liste des messages
    if (secondMockMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        firstMockMessage,
        secondMockMessage!,
      ]);
      console.log("Deux messages simulés ajoutés de personnes différentes");
    } else {
      setMessages((prevMessages) => [...prevMessages, firstMockMessage]);
      console.log("Un message simulé ajouté");
    }
  };

  // Simulation de notification d'appel
  const simulateCallNotification = () => {
    const availableUsers = users.filter(
      (user) => user.email !== currentUser?.email
    );

    if (availableUsers.length < 1 || !currentUser) {
      console.error(
        "Pas assez d'utilisateurs disponibles pour simuler des appels"
      );
      return;
    }

    // Prendre le premier utilisateur
    const firstUser = availableUsers[0];

    // Créer un appel pour le premier utilisateur
    const firstMockCall: Call = {
      call_uuid: `mock-${Date.now()}-1`,
      call_date_create: new Date().toISOString(),
      call_date_end: new Date(Date.now() + 60000).toISOString(), // 1 minute plus tard
      call_type: "missed", // missed, completed
      call_sender: firstUser,
      call_recipient: currentUser,
    };

    // Si on a un deuxième utilisateur disponible
    let secondMockCall: Call | null = null;

    if (availableUsers.length > 1) {
      const secondUser = availableUsers[1];
      secondMockCall = {
        call_uuid: `mock-${Date.now()}-2`,
        call_date_create: new Date(Date.now() - 300000).toISOString(), // 5 minutes avant
        call_date_end: new Date(Date.now() - 270000).toISOString(), // 4:30 minutes avant
        call_type: "missed", // appel manqué
        call_sender: firstUser,
        call_recipient: currentUser,
      };
    }

    // Ajouter le(s) appel(s) simulé(s) à la liste des appels
    if (secondMockCall) {
      setCalls((prevCalls) => [...prevCalls, firstMockCall, secondMockCall!]);
      console.log("Deux appels simulés ajoutés de personnes différentes");
    } else {
      setCalls((prevCalls) => [...prevCalls, firstMockCall]);
      console.log("Un appel simulé ajouté");
    }
  };

  useEffect(() => {
    if (controleur && canal) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
      fetchData();
    }

    return () => {
      if (controleur) {
        controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
      }
    };
  }, [pathname, controleur, canal, currentUser]);

  if (isLoading) return <div>Chargement...</div>;
  if (!currentUser) return <div>Veuillez vous connecter</div>;

  // Fonctions utilitaires pour les compteurs
  const getSentMessagesCount = () => {
    return messages.filter((msg) => msg.message_status === "sent").length;
  };

  const getMissedCallsCount = () => {
    const uniqueCallers = new Set<string>();
    calls
      .filter((call) => call.call_type === "missed")
      .forEach((call) => {
        uniqueCallers.add(call.call_sender.email);
      });
    return uniqueCallers.size;
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.notification}>
          <section className={styles.section}>
            <h1>Boite de réception</h1>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.reception}>
              <div className={styles.reception_header}>
                <Bell />
                {getSentMessagesCount() === 0 ? (
                  <h3>Vous avez aucune notification</h3>
                ) : (
                  <h3>{getSentMessagesCount()} messages en attente</h3>
                )}
                <button
                  onClick={simulateMessageNotification}
                  style={{
                    padding: "6px 12px",
                    marginLeft: "auto",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Simuler une notification
                </button>
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
                {getMissedCallsCount() === 0 ? (
                  <h3>Aucun appel manqué</h3>
                ) : (
                  <h3>{getMissedCallsCount()} appels manqués</h3>
                )}
                <button
                  onClick={simulateCallNotification}
                  style={{
                    padding: "6px 12px",
                    marginLeft: "auto",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Simuler un appel
                </button>
              </div>
              <UsersListCall
                users={users}
                calls={calls}
                currentUserEmail={currentUser?.email || ""}
                isLoading={isLoading}
                limitCalls={5}
              />
            </div>
          </section>
        </div>
        <section className={styles.amis}>
          <h1>Liste d'amis</h1>
          <div className={styles.amis_list_scroll}>
            {users
              .filter((user) => user.email !== currentUser.email)
              .map((user) => (
                <a href="/discussion" key={user.id}>
                  <div className={styles.amis_item}>
                    <img
                      src={
                        user.picture
                          ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${user.picture}`
                          : "/images/default_profile_picture.png"
                      }
                      alt={`${user.firstname} ${user.lastname}`}
                      className={styles.amis_avatar}
                    />
                    <div className={styles.amis_info}>
                      <h2>{`${user.firstname} ${user.lastname}`}</h2>
                      <p>{user.email}</p>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
