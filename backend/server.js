import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Abrir conexão com SQLite
let db;
const initDB = async () => {
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database
  });

  // Criar tabela se não existir
  await db.exec(`
    CREATE TABLE IF NOT EXISTS denuncias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      contato TEXT,
      descricao TEXT NOT NULL,
      anonimo INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
initDB();

// Rota para buscar todas denúncias
app.get("/denuncias", async (req, res) => {
  const rows = await db.all("SELECT * FROM denuncias ORDER BY created_at DESC");
  res.json(rows);
});

// Rota para enviar denúncia
app.post("/denuncias", async (req, res) => {
  const { nome, contato, descricao, anonimo } = req.body;

  if (!descricao) {
    return res.status(400).json({ error: "Descrição é obrigatória" });
  }

  await db.run(
    "INSERT INTO denuncias (nome, contato, descricao, anonimo) VALUES (?, ?, ?, ?)",
    [nome || null, contato || null, descricao, anonimo ? 1 : 0]
  );

  res.json({ message: "Denúncia registrada com sucesso!" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
