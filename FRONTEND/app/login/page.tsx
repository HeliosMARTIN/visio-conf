"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import LoginForm from "../../components/LoginForm"
import styles from "./login.module.css"
import Link from "next/link"
import jwt from "jsonwebtoken"
import { useSocket } from "@/context/SocketProvider"

export default function LoginPage() {
    const router = useRouter()

    const { currentUser } = useSocket()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            const user = jwt.decode(token)
            if (user && currentUser) {
                router.push("/")
            }
        }
    }, [router])

    return (
        <div className={styles.page}>
            <h1>Login to Visioconf !</h1>
            <main className={styles.main}>
                <LoginForm />
            </main>
            <p>
                Don't have an account?{" "}
                <Link href="/signup" className={styles.link}>
                    Sign up
                </Link>
            </p>
        </div>
    )
}
