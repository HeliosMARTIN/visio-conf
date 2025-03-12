import { User } from "@/types/User"

export function fetchUserInfo(controleur: any, userId: string): Promise<User> {
    return new Promise((resolve, reject) => {
        const handler = {
            nomDInstance: "UserInfoService",
            traitementMessage: (msg: any) => {
                if (msg.user_info_response) {
                    if (
                        msg.user_info_response.etat &&
                        msg.user_info_response.userInfo
                    ) {
                        controleur.desincription(
                            handler,
                            ["user_info_request"],
                            ["user_info_response"]
                        )
                        resolve(msg.user_info_response.userInfo)
                    } else {
                        controleur.desincription(
                            handler,
                            ["user_info_request"],
                            ["user_info_response"]
                        )
                        reject(
                            new Error(
                                msg.user_info_response.error ||
                                    "Failed to fetch user info"
                            )
                        )
                    }
                }
            },
        }
        controleur.inscription(
            handler,
            ["user_info_request"],
            ["user_info_response"]
        )

        controleur.envoie(handler, { user_info_request: { userId } })
    })
}
