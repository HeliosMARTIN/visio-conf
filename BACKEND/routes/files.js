import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

// Route pour l'upload de fichiers
router.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: "Aucun fichier n'a été uploadé" });
        }
        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: `/uploads/${req.file.filename}`,
            },
        });
    } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
    }
});

// Route pour servir les fichiers uploadés
router.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);
    res.sendFile(filePath);
});

// Route pour supprimer un fichier
router.delete("/uploads/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, "../uploads", filename);
        await fs.unlink(filePath);
        res.json({ success: true, message: "Fichier supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        res.status(500).json({
            error: "Erreur lors de la suppression du fichier",
        });
    }
});

export default router;
