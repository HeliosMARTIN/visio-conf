"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import { useAppContext } from "@/context/AppContext";
import type { User } from "@/types/User";
import type { Message } from "@/types/Message";
import type { Call } from "@/types/Call";
import {
  Bell,
  Clock,
  Users,
  MessageSquare,
  PhoneCall,
  Video,
  Search,
  UserPlus,
  FileUp,
  X,
  Calendar,
  FileText,
  Activity,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import UserListAmis from "@/components/home/UserListAmis";

// Type étendu pour inclure le statut
interface ExtendedUser extends User {
  status: "online" | "away" | "offline";
}

export default function Home() {
  const pathname = usePathname();
  const { controleur, canal, currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);

  const nomDInstance = "HomePage";
  const verbose = false;

  const listeMessageEmis = [
    "users_list_request",
    "messages_get_request",
    "calls_get_request",
    "discuss_list_request",
  ];

  const listeMessageRecus = [
    "users_list_response",
    "messages_get_response",
    "calls_get_response",
    "discuss_list_response",
  ];

  // Assignation de statuts aux utilisateurs pour la démo
  const assignStatus = (email: string): "online" | "away" | "offline" => {
    // Utiliser l'email comme seed pour avoir un statut cohérent
    const hash = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const statuses = ["online", "away", "offline"] as const;
    return statuses[hash % 3];
  };

  // Gestionnaire de messages du contrôleur
  const handler = {
    nomDInstance,
    traitementMessage: (msg: any) => {
      console.log("Handler message reçu:", msg); // Ajoute ce log
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
          const usersList = msg.users_list_response.users || [];
          setUsers(usersList);

          // Initialiser les utilisateurs filtrés avec tous les utilisateurs
          if (currentUser) {
            const extendedUsers = usersList
              .filter((user: User) => user.email !== currentUser.email)
              .map((user: User) => ({
                ...user,
                status: assignStatus(user.email),
              }));
            setFilteredUsers(extendedUsers);
          }
        }
      }

      if (msg.discuss_list_response) {
        setDiscussions(msg.discuss_list_response.messages || []);
        // Pour chaque discussion privée (2 membres), récupère les messages
        (msg.discuss_list_response.messages || []).forEach(
          (discussion: any) => {
            if (
              discussion.discussion_members &&
              discussion.discussion_members.length === 2
            ) {
              controleur.envoie(handler, {
                messages_get_request: { convId: discussion.discussion_uuid },
              });
            }
          }
        );
      }

      if (msg.messages_get_response) {
        // Fusionne les messages de toutes les discussions privées, sans doublons
        setMessages((prev) => {
          const newMsgs = msg.messages_get_response.messages || [];
          const allMsgs = [...prev, ...newMsgs];
          // Dédoublonnage par message_uuid si présent
          const unique = allMsgs.filter(
            (msg, idx, arr) =>
              arr.findIndex((m) => m.message_uuid === msg.message_uuid) === idx
          );
          return unique;
        });
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

  // Récupération des données
  const fetchData = () => {
    if (controleur && currentUser) {
      controleur.envoie(handler, { users_list_request: {} });
      controleur.envoie(handler, { calls_get_request: {} });
      controleur.envoie(handler, { discuss_list_request: currentUser.id });
    }
  };

  // Fonction de recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!currentUser) return;

    if (query.trim() === "") {
      // Si la recherche est vide, afficher tous les utilisateurs
      const allUsers = users
        .filter((user) => user.email !== currentUser.email)
        .map((user) => ({
          ...user,
          status: assignStatus(user.email),
        }));
      setFilteredUsers(allUsers);
    } else {
      // Filtrer les utilisateurs en fonction de la recherche
      const filtered = users
        .filter((user) => user.email !== currentUser.email)
        .filter(
          (user) =>
            user.firstname.toLowerCase().includes(query) ||
            user.lastname.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.phone && user.phone.includes(query))
        )
        .map((user) => ({
          ...user,
          status: assignStatus(user.email),
        }));
      setFilteredUsers(filtered);
    }
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchQuery("");
    if (currentUser) {
      const allUsers = users
        .filter((user) => user.email !== currentUser.email)
        .map((user) => ({
          ...user,
          status: assignStatus(user.email),
        }));
      setFilteredUsers(allUsers);
    }
  };

  // Statistiques
  const getSentMessagesCount = () => {
    return messages.filter((msg) => msg.message_status === "sent").length;
  };

  const getMissedCallsCount = () => {
    return calls.filter((call) => call.call_type === "missed").length;
  };

  const getActiveUsersCount = () => {
    // Simulons que 60% des utilisateurs sont actifs
    return Math.floor(
      users.filter((user) => user.email !== currentUser?.email).length * 0.6
    );
  };

  // Génération de données fictives pour les activités récentes
  const getRecentActivities = () => {
    if (!discussions.length || !users.length || !currentUser) return [];

    const activities = discussions
      .map((discussion: any) => {
        const lastMsg = discussion.last_message;
        if (!lastMsg) return null;

        // Ne pas afficher les messages envoyés par l'utilisateur courant
        if (lastMsg.message_sender === currentUser.id) return null;

        // Trouver l'expéditeur dans les membres OU dans la liste users
        const sender = (discussion.discussion_members &&
          discussion.discussion_members.find(
            (m: any) => m._id === lastMsg.message_sender
          )) ||
          users.find((u) => u.id === lastMsg.message_sender) || {
            firstname: "Inconnu",
            lastname: "",
            picture: "",
          };

        return {
          type: "message",
          user: sender,
          time: new Date(lastMsg.message_date_create).toLocaleString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }),
          content: lastMsg.message_content || "A envoyé un nouveau message",
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.time).getTime() - new Date(a!.time).getTime())
      .slice(0, 10);

    return activities;
  };

  // Effet pour l'inscription/désinscription au contrôleur
  useEffect(() => {
    if (controleur && canal && currentUser) {
      controleur.inscription(handler, listeMessageEmis, listeMessageRecus);
      fetchData();
      return () => {
        controleur.desincription(handler, listeMessageEmis, listeMessageRecus);
      };
    }
  }, [pathname, controleur, canal, currentUser]);

  // Mettre à jour les utilisateurs filtrés lorsque les utilisateurs ou currentUser changent
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const extendedUsers = users
        .filter((user) => user.email !== currentUser.email)
        .map((user) => ({
          ...user,
          status: assignStatus(user.email),
        }));
      setFilteredUsers(extendedUsers);
    }
  }, [users, currentUser]);

  // Affichage du chargement
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  // Affichage si non connecté
  if (!currentUser)
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div className="text-xl font-semibold text-gray-700">
          Veuillez vous connecter
        </div>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Se connecter
        </a>
      </div>
    );

  const recentActivities = getRecentActivities();

  console.log("Discussion:", discussions);
  console.log("Message", messages);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Colonne principale */}
        <div className={styles.mainColumn}>
          {/* Tableau de bord */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.dashboard_summary}
          >
            <h1 className={styles.sectionTitle}>
              <Zap size={22} /> Tableau de bord
            </h1>
            <div className={styles.summary_cards}>
              <motion.div
                className={styles.summary_card}
                whileHover={{ scale: 1.02 }}
                style={{ borderColor: "#1E3664" }}
              >
                <div className={styles.summary_card_icon}>
                  <MessageSquare size={20} />
                </div>
                <h3>Messages non lus</h3>
                <p>{getSentMessagesCount()}</p>
              </motion.div>

              <motion.div
                className={styles.summary_card}
                whileHover={{ scale: 1.02 }}
                style={{ borderColor: "#F59E0B" }}
              >
                <div className={styles.summary_card_icon}>
                  <PhoneCall size={20} />
                </div>
                <h3>Appels manqués</h3>
                <p>{getMissedCallsCount()}</p>
              </motion.div>

              <motion.div
                className={styles.summary_card}
                whileHover={{ scale: 1.02 }}
                style={{ borderColor: "#10B981" }}
              >
                <div className={styles.summary_card_icon}>
                  <Users size={20} />
                </div>
                <h3>Contacts actifs</h3>
                <p>{getActiveUsersCount()}</p>
              </motion.div>
            </div>

            <div className={styles.quick_actions}>
              <a href="/discussion" className={styles.quick_action}>
                <MessageSquare size={16} />
                <span>Nouvelle discussion</span>
              </a>
              <a href="/discussion" className={styles.quick_action}>
                <Video size={16} />
                <span>Démarrer un appel</span>
              </a>
              <a href="/files" className={styles.quick_action}>
                <FileUp size={16} />
                <span>Partager un fichier</span>
              </a>
              <a href="/equipes" className={styles.quick_action}>
                <UserPlus size={16} />
                <span>Créer une équipe</span>
              </a>
            </div>
          </motion.div>

          <div className={styles.contentColumns}>
            {/* Activités récentes */}
            <motion.section
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className={styles.sectionTitle}>
                <Activity size={20} /> Activités récentes
              </h2>

              <div className={styles.activitiesList}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) =>
                    activity ? (
                      <div key={index} className={styles.activityItem}>
                        <div className={styles.activityAvatar}>
                          <img
                            src={
                              activity.user.picture
                                ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${activity.user.picture}`
                                : "/images/default_profile_picture.png"
                            }
                            alt={`${activity.user.firstname} ${activity.user.lastname}`}
                          />
                        </div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityHeader}>
                            <span className={styles.activityUser}>
                              {activity.user.firstname} {activity.user.lastname}
                            </span>
                            <span className={styles.activityTime}>
                              {activity.time}
                            </span>
                          </div>
                          <p className={styles.activityText}>
                            {activity.content}
                          </p>
                        </div>
                        <div className={styles.activityIcon}>
                          {activity.type === "message" && (
                            <MessageSquare size={16} />
                          )}
                          {activity.type === "call" && <PhoneCall size={16} />}
                          {activity.type === "file" && <FileText size={16} />}
                          {activity.type === "team" && <Users size={16} />}
                        </div>
                      </div>
                    ) : null
                  )
                ) : (
                  <div className={styles.emptyActivities}>
                    <Activity size={40} />
                    <p>Aucune activité récente</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>

        {/* Colonne des contacts */}
        <motion.section
          className={styles.contactsColumn}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className={styles.sectionTitle}>
            <Users size={20} /> Contacts
          </h2>

          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button onClick={clearSearch} className={styles.clearButton}>
                <X size={16} />
              </button>
            )}
          </div>

          {filteredUsers.length > 0 ? (
            <UserListAmis
              users={filteredUsers}
              currentUserEmail={currentUser.email}
            />
          ) : (
            <div className={styles.empty_state}>
              {searchQuery ? (
                <>
                  <Search size={40} />
                  <h3>Aucun résultat trouvé</h3>
                  <p>
                    Aucun contact ne correspond à votre recherche "{searchQuery}
                    "
                  </p>
                  <button onClick={clearSearch} className={styles.resetButton}>
                    Réinitialiser la recherche
                  </button>
                </>
              ) : (
                <>
                  <UserPlus size={40} />
                  <h3>Aucun contact</h3>
                  <p>
                    Commencez à ajouter des contacts pour les voir apparaître
                    ici
                  </p>
                </>
              )}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
