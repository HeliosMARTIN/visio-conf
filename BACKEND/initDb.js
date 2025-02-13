import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { sha256 } from "js-sha256"
import dotenv from "dotenv"
import User from "./models/user.js"
import Role from "./models/role.js"
import Permission from "./models/permission.js"
import Discussion from "./models/discussion.js"

dotenv.config()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const usersToInsert = [
    {
        uuid: uuidv4(),
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        phone: "00.00.00.00.00",
        job: "Responsable RH",
        desc: "Chef de département MMI à l’universite de Toulon. Également professeur de développement web.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Janny",
        lastname: "Doey",
        email: "janny.doey@example.com",
        phone: "00.00.00.00.00",
        job: "Responsable RH",
        desc: "Chef de département MMI à l’universite de Toulon. Également professeur de développement web.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Jean",
        lastname: "Deau",
        email: "jean.deau@example.com",
        phone: "00.00.00.00.00",
        job: "Responsable RH",
        desc: "Chef de département MMI à l’universite de Toulon. Également professeur de développement web.",
        status: "active",
        password:
            "f4f263e439cf40925e6a412387a9472a6773c2580212a4fb50d224d3a817de17",
    },
    {
        uuid: uuidv4(),
        firstname: "Hélios",
        lastname: "Martin",
        email: "heliosmartin.hm@gmail.com",
        phone: "00.00.00.00.00",
        job: "Student",
        desc: "Étudiant à l’université de Toulon. Également développeur web.",
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

    if (adminRole && userRole) {
        usersToInsert.push({
            uuid: uuidv4(),
            firstname: "Admin",
            lastname: "Admin",
            email: ADMIN_EMAIL,
            phone: "00.00.00.00.00",
            job: "Admin",
            desc: "Chef de département MMI à l’universite de Toulon. Également professeur de développement web.",
            password: adminPasswordHash,
            status: "active",
            roles: [adminRole._id, userRole._id],
        })

        for (const user of usersToInsert) {
            if (!user.roles || user.roles.length === 0) {
                user.roles = [userRole._id]
            }
        }
    } else {
        console.error("Les rôles 'admin' ou 'user' n'ont pas été trouvés")
        return
    }

    await User.deleteMany({})
    for (const userData of usersToInsert) {
        const userExists = await User.findOne({
            email: userData.email,
        })

        if (!userExists) {
            const newUser = new User(userData)
            await newUser.save()
            console.log(`Utilisateur ${userData.email} inséré`)
        } else {
            console.log(`Utilisateur ${userData.email} existe déjà`)
        }
    }
}

const initializeDiscussions = async () => {
    const user1 = await User.findOne({ email: "john.doe@example.com" })
    const user2 = await User.findOne({ email: "janny.doey@example.com" })
    const user3 = await User.findOne({ email: "jean.deau@example.com" })
    const user4 = await User.findOne({
        email: "heliosmartin.hm@gmail.com",
    })

    if (!user1 || !user2 || !user3 || !user4) {
        console.error("Un ou plusieurs utilisateurs n'ont pas été trouvés")
        return
    }

    const discussionsToInsert = [
        {
            discussion_uuid: uuidv4(),
            discussion_creator: user1._id,
            ids: [user1._id, user2._id],
        },
        {
            discussion_uuid: uuidv4(),
            discussion_creator: user3._id,
            ids: [user3._id, user4._id],
        },
    ]

    await Discussion.deleteMany({})
    for (const discussionData of discussionsToInsert) {
        const newDiscussion = new Discussion(discussionData)
        await newDiscussion.save()
        console.log(`Discussion ${discussionData.discussion_uuid} insérée`)
    }
}

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
        await User.init()
        await Role.init()
        await Permission.init()
        await initializeRoles()
        await initializeUsers()
        await initializeDiscussions()
        console.log(
            "Collections User / Roles / Permissions / Discussions créées"
        )
        mongoose.connection.close()
    })
    .catch((err) => {
        console.error(err)
    })
