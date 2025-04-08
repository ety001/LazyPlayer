import express from 'express';
import sqlite3 from 'sqlite3';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { verbose } = sqlite3;

const app = express();
const port = 3001;
const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../db/database.db');

// 初始化数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else initDatabase();
});

// 创建数据库表
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER,
      file_path TEXT UNIQUE,
      duration INTEGER,
      FOREIGN KEY(collection_id) REFERENCES collections(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'processing', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(collection_id) REFERENCES collections(id)
    );
  `);
}

// 中间件
app.use(express.json());

// 合集管理接口
app.post('/api/collections', async (req, res) => {
  try {
    const { name, path: collectionPath } = req.body;
    
    db.run(
      'INSERT INTO collections (name, path) VALUES (?, ?)',
      [name, collectionPath],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run(
          'INSERT INTO tasks (collection_id, status) VALUES (?, ?)',
          [this.lastID, 'pending']
        );
        
        startScannerProcess();
        res.json({ id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 目录结构接口
app.get('/api/directories', (req, res) => {
  const targetPath = req.query.path || '/music';
  
  try {
    const files = fs.readdirSync(targetPath, { withFileTypes: true });
    res.json({
      path: targetPath,
      entries: files.map(dirent => ({
        name: dirent.name,
        path: path.join(targetPath, dirent.name),
        isDirectory: dirent.isDirectory()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: '目录读取失败' });
  }
});

// 合集列表接口
app.get('/api/collections', (req, res) => {
  db.all('SELECT * FROM collections', (err, rows) => {
    err ? res.status(500).json({ error: err.message }) : res.json(rows);
  });
});

// 扫描任务队列处理
let isScanning = false;
function startScannerProcess() {
  if (isScanning) return;

  db.get(
    'SELECT * FROM tasks WHERE status = ? ORDER BY created_at ASC LIMIT 1',
    ['pending'],
    (err, task) => {
      if (err || !task) return;

      isScanning = true;
      db.run('UPDATE tasks SET status = ? WHERE id = ?', ['processing', task.id]);

      const scanner = spawn('node', ['scanner.js', task.collection_id]);

      scanner.on('close', (code) => {
        db.run('UPDATE tasks SET status = ? WHERE id = ?', ['completed', task.id]);
        isScanning = false;
        startScannerProcess();
      });
    }
  );
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});