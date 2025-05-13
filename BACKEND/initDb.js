import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { sha256 } from "js-sha256"
import dotenv from "dotenv"
import User from "./models/user.js"
import Role from "./models/role.js"
import Permission from "./models/permission.js"
import Discussion from "./models/discussion.js"
import Team from "./models/team.js"
import Channel from "./models/channel.js"
import ChannelPost from "./models/channelPost.js"
import ChannelPostResponse from "./models/channelPostResponse.js"
import File from "./models/file.js"

dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Utilisateurs de test
const usersToInsert = [
    {
        uuid: uuidv4(),
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "06.12.34.56.78",
        job: "Responsable RH",
        desc: "Chef de département MMI à l'université de Toulon. Également professeur de développement web.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Janny",
        lastname: "Doey",
        email: "janny.doey@example.com",
        phone: "06.23.45.67.89",
        job: "Professeur",
        desc: "Professeur de design graphique à l'université de Toulon.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Jean",
        lastname: "Deau",
        email: "jean.deau@example.com",
        phone: "06.34.56.78.90",
        job: "Responsable Technique",
        desc: "Responsable technique du département informatique. Expert en réseaux et systèmes.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Hélios",
        lastname: "Martin",
        email: "heliosmartin.hm@gmail.com",
        phone: "06.45.67.89.01",
        job: "Étudiant",
        desc: "Étudiant en Master 2 à l'université de Toulon. Développeur web full-stack.",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
        status: "active",
    },
    {
        uuid: uuidv4(),
        firstname: "Sophie",
        lastname: "Durand",
        email: "sophie.durand@example.com",
        phone: "06.56.78.90.12",
        job: "Professeur",
        desc: "Professeur de communication à l'université de Toulon.",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
        status: "active",
    },
    {
        uuid: uuidv4(),
        firstname: "Thomas",
        lastname: "Petit",
        email: "thomas.petit@example.com",
        phone: "06.67.89.01.23",
        job: "Étudiant",
        desc: "Étudiant en Licence 3 à l'université de Toulon. Spécialité développement mobile.",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
        status: "active",
    },
    {
        uuid: uuidv4(),
        firstname: "Marie",
        lastname: "Leroy",
        email: "marie.leroy@example.com",
        phone: "06.78.90.12.34",
        job: "Assistante Administrative",
        desc: "Assistante administrative du département MMI. Gestion des plannings et des inscriptions.",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
        status: "active",
    },
    {
        uuid: uuidv4(),
        firstname: "Lucas",
        lastname: "Moreau",
        email: "lucas.moreau@example.com",
        phone: "06.89.01.23.45",
        job: "Technicien",
        desc: "Technicien audiovisuel à l'université de Toulon. Responsable du matériel de tournage.",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
        status: "active",
    },
]

const initializeRoles = async () => {
    const permissionIds = await initializePermissions()
    const rolesToInsert = [
        {
            role_uuid: "admin",
            role_label: "Administrateur",
            role_permissions: Object.values(permissionIds),
            role_default: true,
        },
        {
            role_uuid: "user",
            role_label: "Utilisateur",
            role_permissions: Object.values(permissionIds),
            role_default: true,
        },
    ]
    await Role.deleteMany({})
    for (const roleData of rolesToInsert) {
        const roleExists = await Role.findOne({
            role_label: roleData.role_label,
        })
        if (!roleExists) {
            const newRole = new Role(roleData)
            await newRole.save()
            console.log(`Role '${roleData.role_label}' inséré`)
        } else {
            console.log(`Role '${roleData.role_label}' existe déjà`)
        }
    }
}

const initializePermissions = async () => {
    const permissions = [
        {
            permission_uuid: "naviguer_vers",
            permission_label: "Naviguer vers",
            permission_default: true,
        },
        {
            permission_uuid: "admin_demande_liste_utilisateurs",
            permission_label: "Lister les utilisateurs",
        },
        {
            permission_uuid: "admin_ajouter_utilisateur",
            permission_label: "Ajouter un utilisateur",
        },
        {
            permission_uuid: "admin_demande_utilisateur_details",
            permission_label: "Détails de l'utilisateur",
        },
        {
            permission_uuid: "admin_supprimer_utilisateur",
            permission_label: "Supprimer un utilisateur",
        },
        {
            permission_uuid: "admin_modifier_utilisateur",
            permission_label: "Modifier un utilisateur",
        },
        {
            permission_uuid: "admin_demande_liste_roles",
            permission_label: "Lister les rôles",
        },
        {
            permission_uuid: "admin_modifier_role",
            permission_label: "Modifier un rôle",
        },
        {
            permission_uuid: "admin_supprimer_role",
            permission_label: "Supprimer un rôle",
        },
        {
            permission_uuid: "admin_demande_liste_permissions",
            permission_label: "Lister les permissions",
        },
        {
            permission_uuid: "admin_ajouter_role",
            permission_label: "Ajouter un rôle",
        },
        {
            permission_uuid: "admin_demande_role_details",
            permission_label: "Détails du rôle",
        },
        {
            permission_uuid: "demande_liste_utilisateurs",
            permission_label: "Lister les utilisateurs",
        },
        { permission_uuid: "demande_annuaire", permission_label: "Annuaire" },
        {
            permission_uuid: "demande_info_utilisateur",
            permission_label: "Information sur un utilisateur",
        },
        {
            permission_uuid: "envoie_message",
            permission_label: "Envoyer un message",
        },
        {
            permission_uuid: "demande_liste_discussions",
            permission_label: "Lister les discussions",
        },
        {
            permission_uuid: "demande_historique_discussion",
            permission_label: "Historique des discussions",
        },
        {
            permission_uuid: "demande_notifications",
            permission_label: "Notifications",
        },
        {
            permission_uuid: "demande_changement_status",
            permission_label: "Changement de status",
        },
        {
            permission_uuid: "update_notifications",
            permission_label: "Mise à jour des notifications",
        },
        {
            permission_uuid: "update_profil",
            permission_label: "Mise à jour du profil",
        },
        {
            permission_uuid: "update_picture",
            permission_label: "Mise à jour de la photo de profil",
        },
        {
            permission_uuid: "demande_creation_discussion",
            permission_label: "Création d'une discussion",
        },
        {
            permission_uuid: "demande_discussion_info",
            permission_label: "Information sur une discussion",
        },
        {
            permission_uuid: "new_call",
            permission_label: "Nouvel appel",
            permission_default: true,
        },
        {
            permission_uuid: "send_ice_candidate",
            permission_label: "Envoi de candidat ICE",
            permission_default: true,
        },
        {
            permission_uuid: "send_offer",
            permission_label: "Envoi d'offre",
            permission_default: true,
        },
        {
            permission_uuid: "send_answer",
            permission_label: "Envoi de réponse",
            permission_default: true,
        },
        {
            permission_uuid: "reject_offer",
            permission_label: "Rejet d'offre",
            permission_default: true,
        },
        {
            permission_uuid: "hang_up",
            permission_label: "Raccrocher",
            permission_default: true,
        },
        {
            permission_uuid: "receive_offer",
            permission_label: "Réception d'offre",
            permission_default: true,
        },
        {
            permission_uuid: "receive_answer",
            permission_label: "Réception de réponse",
            permission_default: true,
        },
        {
            permission_uuid: "receive_ice_candidate",
            permission_label: "Réception de candidat ICE",
            permission_default: true,
        },
        {
            permission_uuid: "offer_rejected",
            permission_label: "Offre rejetée",
            permission_default: true,
        },
        {
            permission_uuid: "call_created",
            permission_label: "Appel créé",
            permission_default: true,
        },
        {
            permission_uuid: "hung_up",
            permission_label: "Raccroché",
            permission_default: true,
        },
        {
            permission_uuid: "call_connected_users",
            permission_label: "Utilisateurs connectés",
            permission_default: true,
        },
    ]
    await Permission.deleteMany({})
    const permissionIds = {}
    for (const permission of permissions) {
        const newPermission = new Permission(permission)
        await newPermission.save()
        permissionIds[permission.permission_uuid] = newPermission._id
        console.log(`Permission '${permission.permission_label}' insérée`)
    }
    return permissionIds
}

const initializeUsers = async () => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log(
            "Les identifiants de l'administrateur ne sont pas définis dans le .env"
        )
        return
    }
    const adminPasswordHash = sha256(ADMIN_PASSWORD)
    const adminRole = await Role.findOne({ role_uuid: "admin" })
    const userRole = await Role.findOne({ role_uuid: "user" })

    if (adminRole && userRole && teacherRole && studentRole) {
        // Ajout de l'administrateur
        usersToInsert.push({
            uuid: uuidv4(),
            firstname: "Admin",
            lastname: "Admin",
            email: ADMIN_EMAIL,
            phone: "06.00.00.00.00",
            job: "Administrateur Système",
            desc: "Administrateur principal de la plateforme VisioConf.",
            password: adminPasswordHash,
            status: "active",
            roles: [adminRole._id, userRole._id],
        })

        // Attribution des rôles aux utilisateurs
        for (const user of usersToInsert) {
            if (!user.roles || user.roles.length === 0) {
                // Attribution de rôles spécifiques selon le job
                if (
                    user.job === "Professeur" ||
                    user.job === "Responsable RH" ||
                    user.job === "Responsable Technique"
                ) {
                    user.roles = [teacherRole._id, userRole._id]
                } else if (user.job === "Étudiant") {
                    user.roles = [studentRole._id, userRole._id]
                } else {
                    user.roles = [userRole._id]
                }
            }
        }
    } else {
        console.error("Un ou plusieurs rôles n'ont pas été trouvés")
        return
    }

    await User.deleteMany({})
    const insertedUsers = []
    for (const userData of usersToInsert) {
        const userExists = await User.findOne({
            email: userData.email,
        })

        if (!userExists) {
            const newUser = new User(userData)
            await newUser.save()
            insertedUsers.push(newUser)
            console.log(`Utilisateur ${userData.email} inséré`)
        } else {
            console.log(`Utilisateur ${userData.email} existe déjà`)
        }
    }
    return insertedUsers
}

const initializeDiscussions = async (users) => {
    if (!users || users.length < 2) {
        console.error("Pas assez d'utilisateurs pour créer des discussions")
        return
    }

    const discussionsToInsert = [
        {
            discussion_uuid: uuidv4(),
            discussion_creator: users[0]._id,
            discussion_members: [users[0]._id, users[1]._id],
            discussion_name: "Discussion John et Janny",
        },
        {
            discussion_uuid: uuidv4(),
            discussion_creator: users[2]._id,
            discussion_members: [users[2]._id, users[3]._id],
            discussion_name: "Discussion Jean et Hélios",
        },
        {
            discussion_uuid: uuidv4(),
            discussion_creator: users[0]._id,
            discussion_members: [users[0]._id, users[2]._id, users[4]._id],
            discussion_name: "Équipe pédagogique",
            discussion_isGroup: true,
        },
        {
            discussion_uuid: uuidv4(),
            discussion_creator: users[3]._id,
            discussion_members: [users[3]._id, users[5]._id, users[7]._id],
            discussion_name: "Projet étudiant",
            discussion_isGroup: true,
        },
        {
            discussion_uuid: uuidv4(),
            discussion_creator: users[4]._id,
            discussion_members: [users[4]._id, users[6]._id],
            discussion_name: "Discussion Sophie et Marie",
        },
    ]

    await Discussion.deleteMany({})
    const insertedDiscussions = []
    for (const discussionData of discussionsToInsert) {
        const newDiscussion = new Discussion(discussionData)
        await newDiscussion.save()
        insertedDiscussions.push(newDiscussion)
        console.log(`Discussion ${discussionData.discussion_name} insérée`)
    }
    return insertedDiscussions
}

const initializeTeams = async (users) => {
    if (!users || users.length < 3) {
        console.error("Pas assez d'utilisateurs pour créer des équipes")
        return
    }

    await Team.deleteMany({})

    const teamsToInsert = [
        {
            id: uuidv4(),
            name: "Département MMI",
            description:
                "Équipe du département Métiers du Multimédia et de l'Internet",
            createdBy: users[0]._id,
            isPublic: true,
            createdAt: new Date(),
        },
        {
            id: uuidv4(),
            name: "Projet Tutoré",
            description:
                "Équipe pour le suivi des projets tutorés des étudiants",
            createdBy: users[2]._id,
            isPublic: true,
            createdAt: new Date(),
        },
        {
            id: uuidv4(),
            name: "Développement Web",
            description:
                "Équipe des enseignants et étudiants en développement web",
            createdBy: users[3]._id,
            isPublic: false,
            createdAt: new Date(),
        },
        {
            id: uuidv4(),
            name: "Communication",
            description: "Équipe de communication de l'université",
            createdBy: users[4]._id,
            isPublic: true,
            createdAt: new Date(),
        },
    ]

    const insertedTeams = []
    for (const teamData of teamsToInsert) {
        const newTeam = new Team(teamData)
        await newTeam.save()
        insertedTeams.push(newTeam)
        console.log(`Équipe ${teamData.name} insérée`)
    }

    // Ajout des membres aux équipes
    const teamMembers = [
        // Département MMI
        {
            teamId: insertedTeams[0].id,
            userId: users[0]._id,
            role: "admin",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[0].id,
            userId: users[1]._id, // Janny Doey - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[0].id,
            userId: users[2]._id,
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[0].id,
            userId: users[4]._id,
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[0].id,
            userId: users[6]._id, // Marie Leroy - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },

        // Projet Tutoré
        {
            teamId: insertedTeams[1].id,
            userId: users[2]._id,
            role: "admin",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[1].id,
            userId: users[0]._id,
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[1].id,
            userId: users[3]._id,
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[1].id,
            userId: users[5]._id, // Thomas Petit - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },

        // Développement Web
        {
            teamId: insertedTeams[2].id,
            userId: users[3]._id,
            role: "admin",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[2].id,
            userId: users[0]._id,
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[2].id,
            userId: users[5]._id, // Thomas Petit - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },

        // Communication
        {
            teamId: insertedTeams[3].id,
            userId: users[4]._id,
            role: "admin",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[3].id,
            userId: users[1]._id, // Janny Doey - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },
        {
            teamId: insertedTeams[3].id,
            userId: users[6]._id, // Marie Leroy - Utilisation de _id au lieu de uuid
            role: "member",
            joinedAt: new Date(),
        },
    ]

    // Mise à jour des équipes avec les membres
    for (const member of teamMembers) {
        const team = insertedTeams.find((t) => t.id === member.teamId)
        if (team) {
            if (!team.members) team.members = []
            team.members.push(member)
            await team.save()
        }
    }

    return insertedTeams
}

const initializeChannels = async (teams, users) => {
    if (!teams || !users) {
        console.error("Équipes ou utilisateurs manquants")
        return
    }

    await Channel.deleteMany({})

    const channelsToInsert = []

    // Création de canaux pour chaque équipe
    for (const team of teams) {
        // Canal général (toujours présent)
        channelsToInsert.push({
            id: uuidv4(),
            name: "Général",
            teamId: team.id,
            isPublic: true,
            createdBy: team.createdBy,
            createdAt: new Date(),
        })

        // Canaux supplémentaires selon l'équipe
        if (team.name === "Département MMI") {
            channelsToInsert.push({
                id: uuidv4(),
                name: "Annonces",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Réunions",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Administration",
                teamId: team.id,
                isPublic: false,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
        } else if (team.name === "Projet Tutoré") {
            channelsToInsert.push({
                id: uuidv4(),
                name: "Suivi des projets",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Ressources",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
        } else if (team.name === "Développement Web") {
            channelsToInsert.push({
                id: uuidv4(),
                name: "Frontend",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Backend",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Projets",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
        } else if (team.name === "Communication") {
            channelsToInsert.push({
                id: uuidv4(),
                name: "Événements",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
            channelsToInsert.push({
                id: uuidv4(),
                name: "Réseaux sociaux",
                teamId: team.id,
                isPublic: true,
                createdBy: team.createdBy,
                createdAt: new Date(),
            })
        }
    }

    const insertedChannels = []
    for (const channelData of channelsToInsert) {
        const newChannel = new Channel(channelData)
        await newChannel.save()
        insertedChannels.push(newChannel)
        console.log(
            `Canal ${channelData.name} inséré dans l'équipe ${
                teams.find((t) => t.id === channelData.teamId).name
            }`
        )
    }

    // Ajout des membres aux canaux
    for (const channel of insertedChannels) {
        const team = teams.find((t) => t.id === channel.teamId)
        if (team && team.members) {
            // Pour les canaux publics, tous les membres de l'équipe sont membres
            if (channel.isPublic) {
                channel.members = team.members.map((member) => ({
                    userId: member.userId,
                    role: member.role,
                    joinedAt: new Date(),
                }))
            }
            // Pour les canaux privés, seulement les admins et quelques membres
            else {
                channel.members = team.members
                    .filter(
                        (member) =>
                            member.role === "admin" || Math.random() > 0.5
                    )
                    .map((member) => ({
                        userId: member.userId,
                        role: member.role,
                        joinedAt: new Date(),
                    }))
            }
            await channel.save()
        }
    }

    return insertedChannels
}

const initializeChannelPosts = async (channels, users) => {
    if (!channels || !users) {
        console.error("Canaux ou utilisateurs manquants")
        return
    }

    await ChannelPost.deleteMany({})
    await ChannelPostResponse.deleteMany({})

    const insertedPosts = []

    // Création de posts pour chaque canal
    for (const channel of channels) {
        const team = await Team.findOne({ id: channel.teamId })
        if (!team) continue

        const teamMembers = team.members || []
        const channelMembers = channel.members || []

        // Récupération des IDs des utilisateurs qui sont membres du canal
        const memberUserIds = channelMembers.map((m) => m.userId.toString())
        const eligibleUsers = users.filter((u) =>
            memberUserIds.includes(u._id.toString())
        )

        if (eligibleUsers.length === 0) continue

        const postCount = Math.floor(Math.random() * 8) + 2 // Entre 2 et 10 posts par canal

        for (let i = 0; i < postCount; i++) {
            const author =
                eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)]

            const postData = {
                _id: mongoose.Types.ObjectId(),
                channelId: channel.id,
                content: `Post ${i + 1} dans le canal ${
                    channel.name
                } de l'équipe ${team.name}. ${getRandomContent()}`,
                author: {
                    _id: author._id,
                    firstname: author.firstname,
                    lastname: author.lastname,
                },
                createdAt: new Date(Date.now() - (postCount - i) * 86400000), // Posts espacés d'un jour
                updatedAt: new Date(Date.now() - (postCount - i) * 86400000),
            }

            const newPost = new ChannelPost(postData)
            await newPost.save()
            insertedPosts.push(newPost)

            // Ajout de réponses aux posts
            const responseCount = Math.floor(Math.random() * 5) // Entre 0 et 4 réponses par post

            for (let j = 0; j < responseCount; j++) {
                const responder =
                    eligibleUsers[
                        Math.floor(Math.random() * eligibleUsers.length)
                    ]

                const responseData = {
                    _id: mongoose.Types.ObjectId(),
                    postId: newPost._id,
                    content: `Réponse ${j + 1} au post de ${
                        author.firstname
                    }. ${getRandomResponse()}`,
                    author: {
                        _id: responder._id,
                        firstname: responder.firstname,
                        lastname: responder.lastname,
                    },
                    createdAt: new Date(
                        postData.createdAt.getTime() + (j + 1) * 3600000
                    ), // Réponses espacées d'une heure après le post
                    updatedAt: new Date(
                        postData.createdAt.getTime() + (j + 1) * 3600000
                    ),
                }

                const newResponse = new ChannelPostResponse(responseData)
                await newResponse.save()
            }
        }

        console.log(`${postCount} posts créés dans le canal ${channel.name}`)
    }
}

const initializeFiles = async (users) => {
    if (!users) {
        console.error("Utilisateurs manquants")
        return
    }

    await File.deleteMany({})

    // Création de dossiers et fichiers pour chaque utilisateur
    for (const user of users) {
        // Dossiers racine
        const rootFolders = [
            {
                id: uuidv4(),
                name: "Documents",
                type: "folder",
                ownerId: user.uuid,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: "Images",
                type: "folder",
                ownerId: user.uuid,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: "Projets",
                type: "folder",
                ownerId: user.uuid,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]

        // Insertion des dossiers racine
        for (const folder of rootFolders) {
            const newFolder = new File(folder)
            await newFolder.save()
            console.log(
                `Dossier ${folder.name} créé pour ${user.firstname} ${user.lastname}`
            )

            // Sous-dossiers et fichiers
            if (folder.name === "Documents") {
                // Sous-dossier Cours
                const coursFolder = new File({
                    id: uuidv4(),
                    name: "Cours",
                    type: "folder",
                    ownerId: user.uuid,
                    parentId: folder.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                await coursFolder.save()

                // Fichiers dans Cours
                const coursFiles = [
                    {
                        id: uuidv4(),
                        name: "cours_web.pdf",
                        type: "file",
                        size: 1024 * 1024 * 2, // 2 MB
                        mimeType: "application/pdf",
                        extension: "pdf",
                        ownerId: user.uuid,
                        parentId: coursFolder.id,
                        path: `files/${user.uuid}/${uuidv4()}/cours_web.pdf`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: uuidv4(),
                        name: "notes_cours.docx",
                        type: "file",
                        size: 1024 * 512, // 512 KB
                        mimeType:
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        extension: "docx",
                        ownerId: user.uuid,
                        parentId: coursFolder.id,
                        path: `files/${user.uuid}/${uuidv4()}/notes_cours.docx`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]

                for (const file of coursFiles) {
                    const newFile = new File(file)
                    await newFile.save()
                }

                // Fichiers dans Documents
                const docFiles = [
                    {
                        id: uuidv4(),
                        name: "rapport_annuel.pdf",
                        type: "file",
                        size: 1024 * 1024 * 3, // 3 MB
                        mimeType: "application/pdf",
                        extension: "pdf",
                        ownerId: user.uuid,
                        parentId: folder.id,
                        path: `files/${
                            user.uuid
                        }/${uuidv4()}/rapport_annuel.pdf`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]

                for (const file of docFiles) {
                    const newFile = new File(file)
                    await newFile.save()
                }
            } else if (folder.name === "Images") {
                // Fichiers dans Images
                const imageFiles = [
                    {
                        id: uuidv4(),
                        name: "photo_profil.jpg",
                        type: "file",
                        size: 1024 * 256, // 256 KB
                        mimeType: "image/jpeg",
                        extension: "jpg",
                        ownerId: user.uuid,
                        parentId: folder.id,
                        path: `files/${user.uuid}/${uuidv4()}/photo_profil.jpg`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: uuidv4(),
                        name: "logo_universite.png",
                        type: "file",
                        size: 1024 * 128, // 128 KB
                        mimeType: "image/png",
                        extension: "png",
                        ownerId: user.uuid,
                        parentId: folder.id,
                        path: `files/${
                            user.uuid
                        }/${uuidv4()}/logo_universite.png`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]

                for (const file of imageFiles) {
                    const newFile = new File(file)
                    await newFile.save()
                }
            } else if (folder.name === "Projets") {
                // Sous-dossier Projet Web
                const projetWebFolder = new File({
                    id: uuidv4(),
                    name: "Projet Web",
                    type: "folder",
                    ownerId: user.uuid,
                    parentId: folder.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                await projetWebFolder.save()

                // Fichiers dans Projet Web
                const projetWebFiles = [
                    {
                        id: uuidv4(),
                        name: "index.html",
                        type: "file",
                        size: 1024 * 10, // 10 KB
                        mimeType: "text/html",
                        extension: "html",
                        ownerId: user.uuid,
                        parentId: projetWebFolder.id,
                        path: `files/${user.uuid}/${uuidv4()}/index.html`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: uuidv4(),
                        name: "style.css",
                        type: "file",
                        size: 1024 * 5, // 5 KB
                        mimeType: "text/css",
                        extension: "css",
                        ownerId: user.uuid,
                        parentId: projetWebFolder.id,
                        path: `files/${user.uuid}/${uuidv4()}/style.css`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: uuidv4(),
                        name: "script.js",
                        type: "file",
                        size: 1024 * 8, // 8 KB
                        mimeType: "application/javascript",
                        extension: "js",
                        ownerId: user.uuid,
                        parentId: projetWebFolder.id,
                        path: `files/${user.uuid}/${uuidv4()}/script.js`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ]

                for (const file of projetWebFiles) {
                    const newFile = new File(file)
                    await newFile.save()
                }
            }
        }
    }
    console.log("Fichiers et dossiers créés pour tous les utilisateurs")
}

// Fonctions utilitaires pour générer du contenu aléatoire
function getRandomContent() {
    const contents = [
        "Bonjour à tous, j'espère que vous allez bien aujourd'hui.",
        "Rappel important : la réunion est prévue pour demain à 14h en salle B204.",
        "Je viens de mettre à jour les documents du projet, n'hésitez pas à les consulter.",
        "Quelqu'un pourrait-il m'aider avec le problème de configuration du serveur ?",
        "Félicitations à toute l'équipe pour le travail accompli cette semaine !",
        "Voici les nouvelles directives pour le semestre à venir.",
        "Je partage avec vous cet article intéressant sur les nouvelles technologies web.",
        "N'oubliez pas de rendre vos rapports avant vendredi prochain.",
        "Bienvenue aux nouveaux membres de l'équipe !",
        "Nous avons besoin de volontaires pour organiser l'événement du mois prochain.",
    ]
    return contents[Math.floor(Math.random() * contents.length)]
}

function getRandomResponse() {
    const responses = [
        "Merci pour l'information !",
        "Je suis disponible pour aider si besoin.",
        "Pouvez-vous préciser davantage ?",
        "Je ne pourrai pas être présent, désolé.",
        "Excellente initiative !",
        "J'ai déjà commencé à travailler dessus.",
        "Je vais regarder ça dès que possible.",
        "Avons-nous une date limite pour ce projet ?",
        "Je suis d'accord avec cette approche.",
        "Pouvons-nous en discuter lors de la prochaine réunion ?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
}

// Fonction principale d'initialisation
const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
    throw new Error(
        "MONGO_URI n'est pas défini dans les variables d'environnement"
    )
}

mongoose
    .connect(mongoUri, {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
    })
    .then(async () => {
        console.log("Connecté à MongoDB")

        // Initialisation des collections
        await User.init()
        await Role.init()
        await Permission.init()
        await Discussion.init()
        await Team.init()
        await Channel.init()
        await ChannelPost.init()
        await ChannelPostResponse.init()
        await File.init()

        // Création des données
        await initializeRoles()
        const users = await initializeUsers()
        const discussions = await initializeDiscussions(users)
        const teams = await initializeTeams(users)
        const channels = await initializeChannels(teams, users)
        await initializeChannelPosts(channels, users)
        await initializeFiles(users)

        console.log("Initialisation de la base de données terminée avec succès")
        mongoose.connection.close()
    })
    .catch((err) => {
        console.error(
            "Erreur lors de l'initialisation de la base de données:",
            err
        )
    })
