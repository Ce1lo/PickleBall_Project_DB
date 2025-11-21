import mysql from 'mysql2/promise';

// Initialize and populate a MySQL database with a simplified schema and some seed data.
// The connection uses environment variables when available, otherwise defaults
// to typical local development settings.  See index.js for details.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '27596',
  database: process.env.MYSQL_DATABASE || 'pickleball',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function run(query, params = []) {
  const [result] = await pool.execute(query, params);
  return result;
}

async function init() {
  // Drop tables if they exist for a fresh start.  MySQL does not allow
  // dropping multiple tables in a single statement when using prepared
  // statements, so we loop.
  const dropQueries = [
    'DROP TABLE IF EXISTS reservation_players',
    'DROP TABLE IF EXISTS reservations',
    'DROP TABLE IF EXISTS waitlist',
    'DROP TABLE IF EXISTS event_registrations',
    'DROP TABLE IF EXISTS events',
    'DROP TABLE IF EXISTS memberships',
    'DROP TABLE IF EXISTS membership_plans',
    'DROP TABLE IF EXISTS payments',
    'DROP TABLE IF EXISTS notifications',
    'DROP TABLE IF EXISTS messages',
    'DROP TABLE IF EXISTS courts',
    'DROP TABLE IF EXISTS players'
  ];
  for (const q of dropQueries) {
    try {
      await run(q);
    } catch (err) {
      // Ignore drop errors
    }
  }

  // Create tables with MySQL‑compatible definitions.  We use appropriate
  // column types (INT, VARCHAR, DATE/DATETIME) and ENUMs to mirror the
  // original SQLite schema.  Additional columns such as payment_status have
  // been added to reservations to match the API implementation in index.js.
  await run(`
    CREATE TABLE IF NOT EXISTS players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      email VARCHAR(255),
      status ENUM('active','expired','none') DEFAULT 'none',
      expiry DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      location VARCHAR(255),
      surface VARCHAR(255),
      indoor TINYINT(1) DEFAULT 0,
      lights TINYINT(1) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      court_id INT NOT NULL,
      player_id INT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status ENUM('booked','cancelled','completed') DEFAULT 'booked',
      price_cents INT DEFAULT 0,
      payment_status VARCHAR(50) DEFAULT 'unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (court_id) REFERENCES courts(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reservation_players (
      reservation_id INT NOT NULL,
      player_id INT NOT NULL,
      role ENUM('host','guest') DEFAULT 'guest',
      PRIMARY KEY (reservation_id, player_id),
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      court_id INT NOT NULL,
      player_id INT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      priority INT DEFAULT 0,
      status ENUM('waiting','notified','booked','cancelled','expired') DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (court_id) REFERENCES courts(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      court_id INT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      max_participants INT,
      fee_cents INT DEFAULT 0,
      status ENUM('draft','open','full','closed','cancelled') DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (court_id) REFERENCES courts(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      player_id INT NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_status ENUM('unpaid','paid','refunded','waived') DEFAULT 'unpaid',
      status ENUM('registered','waitlisted','cancelled','attended','no_show') DEFAULT 'registered',
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS membership_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      period_months INT,
      price_cents INT,
      description TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS memberships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT NOT NULL,
      plan_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('active','expired','pending','cancelled') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (plan_id) REFERENCES membership_plans(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT NOT NULL,
      amount_cents INT NOT NULL,
      currency VARCHAR(10) DEFAULT 'VND',
      source_type VARCHAR(50),
      source_id INT,
      method VARCHAR(50),
      status ENUM('pending','succeeded','failed','refunded','partial') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT,
      channel VARCHAR(50),
      subject VARCHAR(255),
      body TEXT,
      scheduled_at DATETIME,
      sent_at DATETIME,
      status ENUM('queued','sent','failed','cancelled') DEFAULT 'queued',
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT,
      channel VARCHAR(50),
      subject VARCHAR(255),
      body TEXT,
      tags TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('sent','failed') DEFAULT 'sent',
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `);

  // Seed some sample data
  const players = [
    ['Nguyen Van A', '0901002001', 'a@example.com', 'active', '2025-12-31'],
    ['Tran Thi B', '0901002002', 'b@example.com', 'expired', '2024-10-15'],
    ['Le Van C', '0901002003', 'c@example.com', 'active', '2026-01-10'],
    ['Pham Thi D', '0901002004', 'd@example.com', 'none', null],
    ['Hoang Van E', '0901002005', 'e@example.com', 'active', '2025-07-20']
  ];
  for (const p of players) {
    await run('INSERT INTO players (name, phone, email, status, expiry) VALUES (?,?,?,?,?)', p);
  }

  const courts = [
    ['Court 1', 'Main hall', 'hard', 0, 1, 1],
    ['Court 2', 'Outdoor', 'acrylic', 0, 0, 1],
    ['Court 3', 'Indoor', 'wood', 1, 1, 1]
  ];
  for (const c of courts) {
    await run('INSERT INTO courts (name, location, surface, indoor, lights, is_active) VALUES (?,?,?,?,?,?)', c);
  }

  const membershipPlans = [
    ['Monthly', 1, 500000, 'One month membership'],
    ['Quarterly', 3, 1200000, 'Three months membership'],
    ['Annual', 12, 4000000, 'One year membership']
  ];
  for (const m of membershipPlans) {
    await run('INSERT INTO membership_plans (name, period_months, price_cents, description) VALUES (?,?,?,?)', m);
  }

  // Create some memberships: players 1 and 3 have active membership plan 1, players 2 expired
  await run('INSERT INTO memberships (player_id, plan_id, start_date, end_date, status) VALUES (1, 1, "2025-01-01", "2025-12-31", "active")');
  await run('INSERT INTO memberships (player_id, plan_id, start_date, end_date, status) VALUES (2, 2, "2024-01-01", "2024-03-31", "expired")');

  // Reservations (include both completed and booked)
  const now = new Date();
  const isoNow = now.toISOString().slice(0, 10);
  // Build full datetime strings for reservations
  const start1 = `${isoNow} 09:00`;
  const end1 = `${isoNow} 10:00`;
  const start2 = `${isoNow} 11:00`;
  const end2 = `${isoNow} 12:00`;
  await run('INSERT INTO reservations (court_id, player_id, start_time, end_time, status, price_cents, payment_status) VALUES (?,?,?,?,?,?,?)', [1, 1, start1, end1, 'booked', 100000, 'unpaid']);
  await run('INSERT INTO reservations (court_id, player_id, start_time, end_time, status, price_cents, payment_status) VALUES (?,?,?,?,?,?,?)', [2, 2, start2, end2, 'completed', 100000, 'unpaid']);

  // Event and registrations
  const eventStart = `${isoNow} 15:00`;
  const eventEnd = `${isoNow} 18:00`;
  await run('INSERT INTO events (name, description, court_id, start_time, end_time, max_participants, fee_cents, status) VALUES (?,?,?,?,?,?,?,?)', [
    'Summer Tournament', 'Annual summer event', 1, eventStart, eventEnd, 16, 200000, 'open'
  ]);
  await run('INSERT INTO event_registrations (event_id, player_id, payment_status, status) VALUES (1, 1, "paid", "registered")');
  await run('INSERT INTO event_registrations (event_id, player_id, payment_status, status) VALUES (1, 3, "unpaid", "registered")');

  // Sample payments
  await run('INSERT INTO payments (player_id, amount_cents, source_type, source_id, method, status) VALUES (1, 4000000, "membership", 1, "card", "succeeded")');
  await run('INSERT INTO payments (player_id, amount_cents, source_type, source_id, method, status) VALUES (1, 100000, "reservation", 1, "cash", "succeeded")');

  // Generate sample data from 2025-11-30 to 2025-12-03
  console.log('Generating sample data from 2025-11-30 to 2025-12-03...');
  const startDate = new Date('2025-11-30');
  const endDate = new Date('2025-12-03');
  const loopDate = new Date(startDate);

  while (loopDate <= endDate) {
    const dateStr = loopDate.toISOString().slice(0, 10);
    const isLastDay = dateStr === '2025-12-03';

    // If last day (Dec 3), we only want 1-2 reservations TOTAL, not per court
    if (isLastDay) {
      const totalSlots = Math.floor(Math.random() * 2) + 1; // 1 or 2
      for (let k = 0; k < totalSlots; k++) {
        const courtId = Math.floor(Math.random() * 3) + 1;
        const hour = Math.floor(Math.random() * 10) + 8; // 8am - 6pm
        const start = `${dateStr} ${String(hour).padStart(2, '0')}:00`;
        const end = `${dateStr} ${String(hour + 1).padStart(2, '0')}:00`;
        const playerId = Math.floor(Math.random() * 5) + 1;
        const price = 100000 + Math.floor(Math.random() * 3) * 50000;
        const isPaid = Math.random() < 0.7;
        const payStatus = isPaid ? 'paid' : 'unpaid';

        const res = await run('INSERT INTO reservations (court_id, player_id, start_time, end_time, status, price_cents, payment_status) VALUES (?,?,?,?,?,?,?)',
          [courtId, playerId, start, end, 'booked', price, payStatus]);

        if (isPaid) {
          const methods = ['cash', 'card', 'transfer'];
          const method = methods[Math.floor(Math.random() * methods.length)];
          await run('INSERT INTO payments (player_id, amount_cents, source_type, source_id, method, status) VALUES (?, ?, "reservation", ?, ?, "succeeded")',
            [playerId, price, res.insertId, method]);
        }
      }
    } else {
      // Normal generation for Nov 30 - Dec 2
      // For each court
      for (let courtId = 1; courtId <= 3; courtId++) {
        // Available hours: 6 to 21 (last slot starts at 20:00)
        const availableHours = [];
        for (let h = 6; h <= 20; h++) availableHours.push(h);

        // Shuffle hours to pick random slots without overlap
        for (let i = availableHours.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableHours[i], availableHours[j]] = [availableHours[j], availableHours[i]];
        }

        // Pick 4-8 slots per court per day
        const numSlots = Math.floor(Math.random() * 5) + 4;
        const selectedHours = availableHours.slice(0, numSlots);

        for (const hour of selectedHours) {
          const start = `${dateStr} ${String(hour).padStart(2, '0')}:00`;
          const end = `${dateStr} ${String(hour + 1).padStart(2, '0')}:00`;

          // Random player 1-5
          const playerId = Math.floor(Math.random() * 5) + 1;
          const status = 'booked';
          const price = 100000 + Math.floor(Math.random() * 3) * 50000; // 100k, 150k, 200k

          // Random payment status (70% paid)
          const isPaid = Math.random() < 0.7;
          const payStatus = isPaid ? 'paid' : 'unpaid';

          const res = await run('INSERT INTO reservations (court_id, player_id, start_time, end_time, status, price_cents, payment_status) VALUES (?,?,?,?,?,?,?)',
            [courtId, playerId, start, end, status, price, payStatus]);

          if (isPaid) {
            const methods = ['cash', 'card', 'transfer'];
            const method = methods[Math.floor(Math.random() * methods.length)];
            await run('INSERT INTO payments (player_id, amount_cents, source_type, source_id, method, status) VALUES (?, ?, "reservation", ?, ?, "succeeded")',
              [playerId, price, res.insertId, method]);
          }
        }
      }
    }
    loopDate.setDate(loopDate.getDate() + 1);
  }

  console.log('Database initialized');
  await pool.end();
}

init().catch(async (err) => {
  console.error(err);
  try {
    await pool.end();
  } catch (_) {
    /* ignore pool closing errors */
  }
});