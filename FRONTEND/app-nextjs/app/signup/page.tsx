"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import SignupForm from "../../components/SignupForm"
import styles from "./signup.module.css"
import Link from "next/link"

export default function SignupPage() {
    const router = useRouter()

    useEffect(() => {
        const loggedIn = Cookies.get("loggedIn")
        if (loggedIn) {
            router.push("/")
        }
    }, [router])

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <SignupForm />
            </main>
            <p>
                Already have an account?{" "}
                <Link href="/login" className={styles.link}>
                    Login
                </Link>
            </p>
        </div>
    )
}
