import User from "../models/user.js"

class SocketIdentificationService {
    // Returns the user info associated with the given socket id, excluding the password
    async getUserInfoBySocketId(socketId) {
        // Select all fields except 'password'
        const user = await User.findOne({ socket_id: socketId }).select(
            "-password"
        )
        return user
    }

    // Updates the user's socket_id on connection establishment
    async updateUserSocket(userId, socketId) {
        return await User.findOneAndUpdate(
            { _id: userId },
            { socket_id: socketId },
            { new: true }
        )
    }
}

export default new SocketIdentificationService()
