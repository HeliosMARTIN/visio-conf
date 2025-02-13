"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import LoginForm from "../../components/LoginForm"
import styles from "./login.module.css"
import Image from "next/image";
import Link from "next/link"
import jwt from "jsonwebtoken"

export default function LoginPage() {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            const user = jwt.decode(token)
            if (user) {
                router.push("/")
            }
        }
    }, [router])

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Image
                    src="/logo_Univ_grand.svg"
                    alt="Logo"
                    width={340}
                    height={100}
                    priority
                />
                <LoginForm />
                <p className={styles.signup}>
                    <Link href="/signup" className={styles.link}>
                        Pas encore de compte ?
                    </Link>
                </p>
            </main>
        </div>
    )
}
