import { execSync } from 'child_process';
import path from 'path';
import sqlite3 from 'sqlite3';
const { verbose } = sqlite3;
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

// 支持的文件格式
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.aac', '.ogg']);

export default async (collectionId) => {
  try {
    const collection = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM collections WHERE id = ?', [collectionId], (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });

    const scanDirectory = (dirPath) => {
      const files = execSync(`find "${dirPath}" -type f`)
        .toString()
        .split('\n')
        .filter(file => AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()));

      files.forEach(file => {
        const duration = getAudioDuration(file);
        db.run(
          `INSERT INTO music (collection_id, file_path, duration)
           VALUES (?, ?, ?)
           ON CONFLICT(file_path) DO NOTHING`,
          [collectionId, file, duration]
        );
      });
    };

    const getAudioDuration = (filePath) => {
      try {
        const output = execSync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
        );
        return Math.floor(parseFloat(output));
      } catch (err) {
        console.error(`获取时长失败: ${filePath}`, err);
        return 0;
      }
    };

    console.log(`开始扫描合集：${collection.name}`);
    scanDirectory(collection.path);
    console.log(`扫描完成：${collection.name}`);
  } catch (err) {
    console.error('扫描器错误:', err);
  } finally {
    db.close();
  }
};