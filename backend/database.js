const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// 資料庫檔案路徑 (Vercel 環境使用 /tmp 目錄，Railway 使用持久化目錄)
const dbPath = (() => {
  if (process.env.NODE_ENV === "production") {
    return "/tmp/database.sqlite"; // Vercel
  } else if (process.env.RAILWAY_ENVIRONMENT) {
    return path.join(__dirname, "database.sqlite"); // Railway
  } else {
    return path.join(__dirname, "database.sqlite"); // 本地開發
  }
})();

// 建立資料庫連接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ 資料庫連接失敗:", err.message);
    console.error("資料庫路徑:", dbPath);
  } else {
    console.log("✅ 成功連接到 SQLite 資料庫");
    console.log("資料庫路徑:", dbPath);
  }
});

// 初始化資料庫表格
function initDatabase() {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, "../database_schema.sql");
    console.log("🔍 尋找資料庫 schema 檔案:", schemaPath);

    // 檢查檔案是否存在
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ 資料庫 schema 檔案不存在:", schemaPath);
      console.log("📁 當前目錄內容:");
      try {
        const files = fs.readdirSync(path.join(__dirname, ".."));
        files.forEach((file) => console.log("  -", file));
      } catch (e) {
        console.log("  無法讀取目錄");
      }
      reject(new Error(`資料庫 schema 檔案不存在: ${schemaPath}`));
      return;
    }

    const schema = fs.readFileSync(schemaPath, "utf8");

    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ 資料庫初始化失敗:", err.message);
        reject(err);
      } else {
        console.log("✅ 資料庫表格初始化完成");
        resolve();
      }
    });
  });
}

// 檢查資料庫是否已初始化
function checkDatabaseExists() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='customers'",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      }
    );
  });
}

// 自動初始化資料庫
async function setupDatabase() {
  try {
    const exists = await checkDatabaseExists();
    if (!exists) {
      console.log("🔄 初始化資料庫...");
      await initDatabase();
    } else {
      console.log("✅ 資料庫已存在，跳過初始化");
    }
  } catch (error) {
    console.error("❌ 資料庫設置失敗:", error);
    throw error;
  }
}

// 通用查詢函數
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 單一查詢函數
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// 執行函數（INSERT, UPDATE, DELETE）
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

module.exports = {
  db,
  query,
  get,
  run,
  setupDatabase,
  initDatabase,
};
