"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { Message } from "../../types/Message";
import { User } from "../../types/User";
import { CreateDiscussion } from "../../components/discussion/Create/page";
import "./discussion.css";

export default function DiscussionPage() {
    const { currentUser } = useSocket();

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <main>
                <div><h1>Messages for {currentUser.email}</h1></div>
                <div><CreateDiscussion/></div>
            </main>
        </div>
    );
}
