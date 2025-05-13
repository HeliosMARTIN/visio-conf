import { Folder } from "lucide-react"
import styles from "./page.module.css"
import FileExplorerContainer from "./components/FileExplorerContainer"

export default function FilesPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <Folder className={styles.icon} />
                    <h1 className={styles.title}>Mes Fichiers</h1>
                </div>
                <p className={styles.subtitle}>
                    Gérez et organisez vos fichiers en toute simplicité
                </p>
            </div>
            <div className={styles.fileExplorerContainer}>
                <FileExplorerContainer />
            </div>
        </div>
    )
}
