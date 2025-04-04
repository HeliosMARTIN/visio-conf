"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import LoginForm from "../../components/LoginForm"
import styles from "./login.module.css"
import Link from "next/link"
import jwt from "jsonwebtoken"
import { useAppContext } from "@/context/AppContext"

export default function LoginPage() {
    const router = useRouter()

    const { currentUser } = useAppContext()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            if (currentUser) {
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
