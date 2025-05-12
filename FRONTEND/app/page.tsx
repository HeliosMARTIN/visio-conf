"use client"
import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import styles from "./page.module.css"
import UsersList from "../components/UsersList"
import CurrentUser from "../components/CurrentUser"
import { User } from "../types/User"
import { useAppContext } from "@/context/AppContext"
import HomeAdmin from "../components/admin/HomeAdmin"
import Cookies from "js-cookie"

export default function Home() {
    const { controleur, canal, currentUser, setCurrentUser } = useAppContext()
    const router = useRouter()
    const [tab, setTab] = useState<string>("");
    const pathname = usePathname()

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
    const pendingFileRef = useRef<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [uploadMessage, setUploadMessage] = useState("")

    const handler = {
        nomDInstance,
        traitementMessage: (msg: {
            users_list_response?: {
                etat: boolean
                users?: User[]
                error?: string
            }
            upload_response?: {
                etat: boolean
                error?: string
                fileName?: string
                signedUrl?: string
            }
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
                if (
                    msg.upload_response.etat &&
                    pendingFileRef.current &&
                    msg.upload_response.signedUrl
                ) {
                    // Set mode to "cors" explicitly.
                    fetch(msg.upload_response.signedUrl, {
                        method: "PUT",
                        mode: "cors",
                        body: pendingFileRef.current,
                        headers: {
                            "Content-Type": pendingFileRef.current.type,
                        },
                    })
                        .then((response) => {
                            if (response.ok) {
                                const updateProfilePictureMessage = {
                                    update_user_request: {
                                        picture: msg.upload_response?.fileName,
                                    },
                                }
                                controleur.envoie(
                                    handler,
                                    updateProfilePictureMessage
                                )
                                pendingFileRef.current = null
                            } else {
                                setUploadMessage(
                                    "S3 upload failed: " + response.statusText
                                )
                            }
                        })
                        .catch((error) => {
                            setUploadMessage(
                                "S3 upload error: " + error.message
                            )
                        })
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
    }, [pathname, controleur, canal])

    const fetchUsersList = () => {
        try {
            const T = { users_list_request: {} }
            controleur?.envoie(handler, T)
        } catch (err) {
            setError("Failed to fetch users list. Please try again.")
        }
    }

    const handleLogout = () => {
        Cookies.remove("token") // Remove token from cookies
        setCurrentUser(null)
        router.push("/login")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB threshold

    const handleUpload = () => {
        if (selectedFile && controleur) {
            if (selectedFile.size > MAX_FILE_SIZE) {
                alert(
                    "File is too large to upload over WebSocket. Please select a smaller file."
                )
                return
            }
            // Save file to ref so it remains available in the handler
            pendingFileRef.current = selectedFile
            // Clear selectedFile in state and reset the file input display
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
            // Send only file name and type; backend (AwsS3Service) generates a signed URL.
            const uploadMessage = {
                upload_request: {
                    media: {
                        name: selectedFile.name,
                        fileType: selectedFile.type,
                    },
                },
            }
            controleur.envoie(handler, uploadMessage)
        } else {
            alert("Please select a file first")
        }
    }

    const handleDiscussion = () => {
        router.push("/discussion")
    }

    if(tab==="admin"){
        return <HomeAdmin user={currentUser} />
    }
    else{
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
                    <button onClick={() => setTab("admin")}>Admin</button>
                </main>
                {currentUser && <CurrentUser user={currentUser} />}
            </div>
        )
    }
}
