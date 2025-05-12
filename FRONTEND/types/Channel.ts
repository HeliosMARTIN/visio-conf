export interface Channel {
    id: string
    name: string
    description: string
    isPublic: boolean
    createdAt: string
    createdBy: string
    members: ChannelMember[]
}

export interface ChannelMember {
    id: string
    userId: string
    channelId: string
    role: "admin" | "member"
    joinedAt: string
    name: string
    avatar?: string
}

export interface ChannelListResponse {
    etat: boolean
    channels?: Channel[]
    error?: string
}

export interface ChannelResponse {
    etat: boolean
    channel?: Channel
    error?: string
}

export interface ChannelMembersResponse {
    etat: boolean
    members?: ChannelMember[]
    error?: string
}

export interface ChannelCreateRequest {
    name: string
    teamId: string
    isPublic: boolean
    members?: string[] // Array of user IDs
}

export interface ChannelUpdateRequest {
    id: string
    name?: string
    isPublic?: boolean
}

export interface ChannelMemberRequest {
    channelId: string
    userId: string
}

export interface ChannelPost {
    id: string
    channelId: string
    authorId: string
    authorName: string
    authorAvatar?: string
    content: string
    createdAt: string
    responseCount: number
}

export interface ChannelPostResponse {
    id: string
    postId: string
    authorId: string
    authorName: string
    authorAvatar?: string
    content: string
    createdAt: string
}

export interface ChannelDeleteResponse {
    etat: boolean
    error?: string
}

export interface ChannelPostsResponse {
    etat: boolean
    posts?: ChannelPost[]
    error?: string
}

export interface ChannelPostResponsesRequest {
    postId: string
}

export interface ChannelPostResponsesResponse {
    etat: boolean
    responses?: ChannelPostResponse[]
    error?: string
}

export interface User {
    id: string
    firstname: string
    lastname: string
    email: string
    picture?: string
    phone?: string
}
