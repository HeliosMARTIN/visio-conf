"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from './Menu.module.css';
import { useAppContext } from "@/context/AppContext";

export default function Menu({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={styles.mainLayout}>
      <div
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded}`}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <div className={styles.sidebarContent}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logoLink}>
              <Image src="/logo_Univ.png" alt="Logo" width={40} height={40} priority className={styles.logoImage} />
              <h2 className={`${styles.menuText} ${collapsed ? styles.hidden : ''}`}>
                Université de Toulon
              </h2>
            </Link>
          </div>
          
          <nav className={styles.menuItems}>
            <Link href="/discussions" className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <Image src="/conversation.svg" alt="Discussions" width={25} height={25} />
              </div>
              <span className={`${styles.menuItemText} ${collapsed ? styles.hidden : ''}`}>
                Discussions
              </span>
            </Link>
            
            <Link href="/equipes" className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <Image src="/users.svg" alt="equipes" width={25} height={25} />
              </div>
              <span className={`${styles.menuItemText} ${collapsed ? styles.hidden : ''}`}>
                Equipes
              </span>
            </Link>
            
            <Link href="/dossiers" className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <Image src="/folder.svg" alt="Dossiers" width={25} height={25} />
              </div>
              <span className={`${styles.menuItemText} ${collapsed ? styles.hidden : ''}`}>
                Dossiers
              </span>
            </Link>
            
            <Link href="/annuaire" className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <Image src="/livre.svg" alt="Annuaire" width={25} height={25} />
              </div>
              <span className={`${styles.menuItemText} ${collapsed ? styles.hidden : ''}`}>
                Annuaire
              </span>
            </Link>
          </nav>
          <div className={styles.profileContainer}>
            <Link href="/profil" className={styles.profileLink}>
              <Image
                className={styles.profileImage}
                src={
                  currentUser?.picture
                    ? `https://visioconfbucket.s3.eu-north-1.amazonaws.com/${currentUser.picture}`
                    : `https://visioconfbucket.s3.eu-north-1.amazonaws.com/default_profile_picture.png`
                }
                alt="profil"
                width={40}
                height={40}
                priority
                unoptimized
              />
            </Link>
          </div>
        </div>
      </div>
      <div className={`${styles.contentContainer} ${!collapsed ? styles.contentExpanded : ''}`}>
        {children}
      </div>
    </div>
  );
}