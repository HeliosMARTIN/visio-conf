export interface Team {
    id: string
    name: string
    description?: string
    createdBy: string
    createdAt: string
    updatedAt: string
    role?: string // Le rôle de l'utilisateur dans cette équipe
    deleted?: boolean // Indique si l'équipe a été supprimée
}

export interface TeamMember {
    id: string
    teamId: string
    userId: string
    role: string
    joinedAt: string
    firstname?: string
    lastname?: string
    picture?: string
}
