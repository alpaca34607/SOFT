// 資料庫適配器 - 統一 SQLite 和 PostgreSQL 的介面

const usePostgres = process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

let dbModule;
if (usePostgres) {
    dbModule = require('./database-postgres');
} else {
    dbModule = require('./database');
}

// SQLite 風格的查詢適配器
async function query(sql, params = []) {
    if (usePostgres) {
        // PostgreSQL 使用 $1, $2, $3... 格式
        const pgSql = convertSQLiteToPostgreSQL(sql);
        const result = await dbModule.query(pgSql, params);
        return {
            rows: result.rows,
            rowCount: result.rowCount,
            lastInsertRowid: result.rows[0]?.id // PostgreSQL 返回 id
        };
    } else {
        // SQLite 原始查詢
        return new Promise((resolve, reject) => {
            const db = dbModule.getDatabase();
            if (sql.toLowerCase().includes('insert')) {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({ 
                        rows: [], 
                        rowCount: this.changes,
                        lastInsertRowid: this.lastID 
                    });
                });
            } else {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ 
                        rows: rows || [], 
                        rowCount: rows ? rows.length : 0 
                    });
                });
            }
        });
    }
}

// 獲取單一記錄
async function get(sql, params = []) {
    const result = await query(sql, params);
    return result.rows[0] || null;
}

// 執行更新/插入
async function run(sql, params = []) {
    const result = await query(sql, params);
    return {
        lastID: result.lastInsertRowid,
        changes: result.rowCount
    };
}

// 將 SQLite SQL 轉換為 PostgreSQL SQL
function convertSQLiteToPostgreSQL(sql) {
    let pgSql = sql;
    
    // 替換參數佔位符 ? 為 $1, $2, $3...
    let paramIndex = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
    
    // 處理 AUTOINCREMENT -> SERIAL (這個已在 schema 中處理)
    // 處理 INTEGER -> INTEGER (相容)
    // 處理 TEXT -> TEXT (相容)
    
    // 處理 RETURNING 子句（PostgreSQL 特有）
    if (pgSql.toLowerCase().includes('insert') && !pgSql.toLowerCase().includes('returning')) {
        pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id;');
    }
    
    return pgSql;
}

// 資料庫設置
async function setupDatabase() {
    return await dbModule.setupDatabase();
}

// 獲取原始資料庫實例（用於特殊操作）
function getDatabase() {
    if (usePostgres) {
        return dbModule.pool();
    } else {
        return dbModule.getDatabase ? dbModule.getDatabase() : null;
    }
}

module.exports = {
    query,
    get,
    run,
    setupDatabase,
    getDatabase,
    usePostgres
};