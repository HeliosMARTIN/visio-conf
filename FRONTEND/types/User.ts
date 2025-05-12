export interface User {
    _id: string
    id: string
    firstname: string
    lastname: string
    email: string
    status : string
    roles : string[]
    picture?: string
    socket_id? : string
    phone: string,
    job : string,
    desc : string
}
