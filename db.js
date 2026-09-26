// ---------- DATA TIER ----------
// Owns the SQLite file and table schema. Nothing outside this file
// talks to SQLite directly — routes.js only calls the functions below.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'eyetech.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket TEXT UNIQUE NOT NULL,
    name TEXT, phone TEXT, service TEXT, issue TEXT, description TEXT,
    status TEXT DEFAULT 'Open',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, phone TEXT, message TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS availability_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, phone TEXT, address TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS quote_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT, phone TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, rating INTEGER, review TEXT,
    created_at INTEGER NOT NULL
  );
`);

function genTicket() {
  return 'ET' + Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
  createComplaint({ name, phone, service, issue, description }) {
    let ticket;
    do { ticket = genTicket(); }
    while (db.prepare('SELECT 1 FROM complaints WHERE ticket = ?').get(ticket));
    const created_at = Date.now();
    db.prepare(`INSERT INTO complaints (ticket,name,phone,service,issue,description,status,created_at)
                VALUES (?,?,?,?,?,?,'Open',?)`)
      .run(ticket, name, phone, service, issue, description, created_at);
    return { ticket, status: 'Open', created_at };
  },
  getComplaintByTicket(ticket) {
    return db.prepare('SELECT * FROM complaints WHERE ticket = ?').get(ticket.toUpperCase());
  },
  createContactMessage(data) {
    const created_at = Date.now();
    db.prepare('INSERT INTO contact_messages (name,phone,message,created_at) VALUES (?,?,?,?)')
      .run(data.name, data.phone, data.message, created_at);
    return { ...data, created_at };
  },
  createAvailabilityRequest(data) {
    const created_at = Date.now();
    db.prepare('INSERT INTO availability_requests (name,phone,address,created_at) VALUES (?,?,?,?)')
      .run(data.name, data.phone, data.address, created_at);
    return { ...data, created_at };
  },
  createQuoteRequest(data) {
    const created_at = Date.now();
    db.prepare('INSERT INTO quote_requests (service,phone,created_at) VALUES (?,?,?)')
      .run(data.service, data.phone, created_at);
    return { ...data, created_at };
  },
  createReview(data) {
    const created_at = Date.now();
    const info = db.prepare('INSERT INTO reviews (name,rating,review,created_at) VALUES (?,?,?,?)')
      .run(data.name, data.rating, data.review, created_at);
    return { id: info.lastInsertRowid, ...data, created_at };
  },
  listReviews(limit = 6) {
    return db.prepare('SELECT id,name,rating,review,created_at FROM reviews ORDER BY created_at DESC LIMIT ?')
      .all(limit);
  },
};
