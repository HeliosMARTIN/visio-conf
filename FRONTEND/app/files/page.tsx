import styles from "./page.module.css"
import FileExplorerContainer from "./components/FileExplorerContainer"

export default function FilesPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Mes Fichiers</h1>
            <div className={styles.fileExplorerContainer}>
                <FileExplorerContainer />
            </div>
        </div>
    )
}
