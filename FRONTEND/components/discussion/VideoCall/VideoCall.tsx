"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { User } from "@/types/User";
import { Discussion } from "@/types/Discussion";
import "./VideoCall.css";

interface VideoCallProps {
    discussion: Discussion;
    currentUser: User;
    onEndCall: () => void;
    localStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;
    error: string | null;
}

const VideoCall: React.FC<VideoCallProps> = ({
    discussion,
    currentUser,
    onEndCall,
    localStream,
    peerConnection,
    error,
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Mettre à jour les streams vidéo quand ils changent
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (peerConnection) {
            peerConnection.ontrack = (event) => {
                console.log("VideoCall - Réception stream distant");
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        }
    }, [peerConnection]);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    if (error) {
        return (
            <div className="video-call-error">
                <p>{error}</p>
                <button onClick={onEndCall}>Fermer</button>
            </div>
        );
    }

    return (
        <div className="video-call-container">
            <div className="video-grid">
                <div className="video-wrapper local">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="video-element"
                    />
                    <div className="video-label">Vous</div>
                </div>
                <div className="video-wrapper remote">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="video-element"
                    />
                    <div className="video-label">Interlocuteur</div>
                </div>
            </div>
            <div className="video-controls">
                <button
                    onClick={toggleMute}
                    className={`control-button ${isMuted ? "active" : ""}`}
                >
                    {isMuted ? "Démuter" : "Muet"}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`control-button ${isVideoOff ? "active" : ""}`}
                >
                    {isVideoOff ? "Activer caméra" : "Désactiver caméra"}
                </button>
                <button onClick={onEndCall} className="control-button end-call">
                    Terminer l'appel
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
