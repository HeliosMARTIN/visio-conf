"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import UsersList from "../components/UsersList"
import CurrentUser from "../components/CurrentUser"
import { User } from "../types/User"
import { useAppContext } from "@/context/AppContext"

export default function Home() {
    const { controleur, canal, currentUser, setCurrentUser } = useAppContext()
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
        }
    }, [currentUser, router])

    const nomDInstance = "HomePage"
    const verbose = false

    const listeMessageEmis = [
        "users_list_request",
        "upload_request",
        "update_user_request",
    ]
    const listeMessageRecus = [
        "users_list_response",
        "upload_response",
        "update_user_response",
    ]

    const [users, setUsers] = useState<User[]>([])
    const [error, setError] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadMessage, setUploadMessage] = useState("")

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            users_list_response?: {
                etat: boolean
                users?: User[]
                error?: string
            }
            upload_response?: { etat: boolean; error?: string; url?: string }
            update_user_response?: {
                etat: boolean
                newUserInfo: User | null
                error?: string
            }
        }) => {
            if (verbose || controleur?.verboseall)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                )
            if (msg.users_list_response) {
                if (!msg.users_list_response.etat) {
                    setError(
                        `Fetching users failed: ${msg.users_list_response.error}`
                    )
                } else {
                    setUsers(msg.users_list_response.users || [])
                }
            }
            if (msg.upload_response) {
                if (msg.upload_response.etat) {
                    setUploadMessage(
                        "Upload successful: " + msg.upload_response.url
                    )
                } else {
                    setUploadMessage(
                        "Upload failed: " + msg.upload_response.error
                    )
                }
            }
            if (msg.update_user_response) {
                if (msg.update_user_response.etat) {
                    setCurrentUser(msg.update_user_response.newUserInfo)
                } else {
                    console.log(
                        "Failed to update user info: ",
                        msg.update_user_response.error
                    )
                }
            }
        },
    }

    useEffect(() => {
        if (controleur && canal) {
            controleur.inscription(handler, listeMessageEmis, listeMessageRecus)
        }
        return () => {
            if (controleur) {
                controleur.desincription(
                    handler,
                    listeMessageEmis,
                    listeMessageRecus
                )
            }
        }
    }, [router, controleur, canal])

    const fetchUsersList = () => {
        try {
            const T = { users_list_request: {} }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Failed to fetch users list. Please try again.")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        setCurrentUser(null)
        router.push("/login")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = () => {
        if (selectedFile && controleur) {
            const reader = new FileReader()
            reader.onload = (event) => {
                let base64data = event.target?.result
                if (typeof base64data === "string") {
                    // Remove data URL prefix if present
                    const commaIndex = base64data.indexOf(",")
                    base64data =
                        commaIndex !== -1
                            ? base64data.substring(commaIndex + 1)
                            : base64data
                }
                const uploadMessage = {
                    upload_request: {
                        media: {
                            name: selectedFile.name,
                            fileType: selectedFile.type,
                            data: base64data,
                        },
                    },
                }
                const updateProfilePictureMessage = {
                    update_user_request: {
                        picture: selectedFile.name,
                    },
                }
                controleur.envoie(handler, uploadMessage)
                controleur.envoie(handler, updateProfilePictureMessage)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            alert("Please select a file first")
        }
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Accueil - Visioconf</h1>
                {error && <div className={styles.error}>{error}</div>}
                {uploadMessage && (
                    <div className={styles.info}>{uploadMessage}</div>
                )}
                <button onClick={fetchUsersList}>Fetch Users List</button>
                <UsersList
                    users={users}
                    currentUserEmail={currentUser?.email || ""}
                />
                <div style={{ marginTop: "1rem" }}>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload File</button>
                </div>
                <button onClick={handleLogout}>Logout</button>
            </main>
            {currentUser && <CurrentUser user={currentUser} />}
        </div>
    )
}
