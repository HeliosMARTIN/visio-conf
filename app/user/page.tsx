'use client'
import Image from "next/image";
import styles from "./../page.module.css";
import Controleur from "../controleur.js" ;
import CanalSocketio from "../canalsocketio/canalsocketio.js";
import { io } from 'socket.io-client';
import { useState, useRef, useEffect } from 'react';
const  controleur=new Controleur();
const instanceName = "PageConnexion";
const canalsocketio=new CanalSocketio(io,controleur,"canalsocketio"));

export default function Home() {






	var listeDesMessagesEmis=new Array("connexion_requete");
	var listeDesMessagesRecus=new Array("connexion_reponse");
	var verbose=false;

    const mdp=useRef(null);
    const login=useRef(null);

    const {current} = useRef({
        instanceName,
        traitementMessage: (msg) => {
            if (verbose || controleur.verboseall) console.log(`INFO: (${instanceName}) - traitementMessage - `, msg);

            if (typeof msg.connexion_reponse !== "undefined") {
              if(msg.connexion_reponse.etat=="true"){
                console.log("vous êtes connecté");
              }else{
                console.log("mauvais login/mdp");
              }

            }
        }
    });

    useEffect(() => {
        controleur.inscription(current, listeDesMessagesEmis, listeDesMessagesRecus);

        return () => {
            controleur.desinscription(current, listeDesMessagesEmis, listeDesMessagesRecus);
        };
    }, [current]);

  return (
     <div className={styles.page}>

        <main>
                Login: <input type="text" class="login_input" ref={login}/>
				mdp: <input type="text" class="login_input" ref={mdp} />
				<button className="login_ok" onClick={ () =>{controleur.envoie(current,{connexion_requete:{login:login.current.value,mdp:mdp.current.value}})}} >OK</button>

        </main>

    </div>
  );
}
