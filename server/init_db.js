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
      order_code VARCHAR(20) UNIQUE,
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
  // Seed some sample data
  const players = [
    ['Nguyễn Văn An', '0901234567', 'an.nguyen@example.com', 'active', '2025-12-31'],
    ['Trần Thị Bình', '0912345678', 'binh.tran@example.com', 'expired', '2024-10-15'],
    ['Lê Văn Cường', '0987654321', 'cuong.le@example.com', 'active', '2026-01-10'],
    ['Phạm Thị Dung', '0934567890', 'dung.pham@example.com', 'none', null],
    ['Hoàng Văn Em', '0965432109', 'em.hoang@example.com', 'active', '2025-07-20'],
    ['Võ Thị Hương', '0978123456', 'huong.vo@example.com', 'active', '2025-11-30'],
    ['Đặng Văn Giàu', '0909876543', 'giau.dang@example.com', 'none', null],
    ['Bùi Thị Hạnh', '0918765432', 'hanh.bui@example.com', 'active', '2025-09-15'],
    ['Ngô Văn Hùng', '0932123456', 'hung.ngo@example.com', 'expired', '2024-05-20'],
    ['Dương Thị Lan', '0945678901', 'lan.duong@example.com', 'active', '2026-03-01']
  ];
  for (const p of players) {
    await run('INSERT INTO players (name, phone, email, status, expiry) VALUES (?,?,?,?,?)', p);
  }

  const courts = [
    ['Sân 1', 'Khu A - Ngoài trời', 'Acrylic', 0, 1, 1],
    ['Sân 2', 'Khu A - Ngoài trời', 'Bê tông', 0, 1, 1],
    ['Sân 3', 'Khu B - Trong nhà', 'Gỗ', 1, 1, 1],
    ['Sân 4', 'Khu B - Trong nhà', 'Cao su', 1, 1, 1],
    ['Sân 5', 'Khu C - VIP', 'Acrylic Pro', 1, 1, 1]
  ];
  for (const c of courts) {
    await run('INSERT INTO courts (name, location, surface, indoor, lights, is_active) VALUES (?,?,?,?,?,?)', c);
  }



  // Helper function to format currency for logging
  function formatCurrency(cents) {
    return (cents / 100).toLocaleString('vi-VN') + 'đ';
  }

  // Generate sample reservations and events from 2025-11-22 to 2025-12-05
  console.log('\nGenerating sample data from 2025-11-22 to 2025-12-05...');
  const startDate = new Date('2025-11-22');
  const endDate = new Date('2025-12-05');
  const loopDate = new Date(startDate);

  // Event dates to sprinkle throughout the period
  const eventDates = [
    { date: '2025-11-23', name: 'Giải Giao Hữu Cuối Tuần', court: 1, time: '14:00-17:00' },
    { date: '2025-11-27', name: 'Buổi Tập Luyện CLB', court: null, time: '18:00-20:00' },
    { date: '2025-11-30', name: 'Giải Đấu Tháng 11', court: 3, time: '09:00-16:00' },
    { date: '2025-12-01', name: 'Workshop Kỹ Thuật', court: 5, time: '10:00-12:00' },
    { date: '2025-12-04', name: 'Mini Tournament', court: 2, time: '15:00-18:00' }
  ];

  while (loopDate <= endDate) {
    const dateStr = loopDate.toISOString().slice(0, 10);
    
    // Track used slots to avoid overlaps on same court
    const usedSlots = new Map(); // court_id -> Set of hours

    // Check if this date has an event
    const eventForDate = eventDates.find(e => e.date === dateStr);
    if (eventForDate) {
      const [startHour, endHour] = eventForDate.time.split('-').map(t => parseInt(t.split(':')[0]));
      const eventStart = `${dateStr} ${String(startHour).padStart(2, '0')}:00`;
      const eventEnd = `${dateStr} ${String(endHour).padStart(2, '0')}:00`;
      
      const eventRes = await run('INSERT INTO events (name, description, court_id, start_time, end_time, max_participants, fee_cents, status) VALUES (?,?,?,?,?,?,?,?)', [
        eventForDate.name,
        `Sự kiện ${eventForDate.name}`,
        eventForDate.court,
        eventStart,
        eventEnd,
        Math.floor(Math.random() * 8) + 8, // 8-16 người
        [0, 50000, 100000, 150000][Math.floor(Math.random() * 4)],
        'open'
      ]);

      // Add 2-4 random registrations for each event
      const numRegs = Math.floor(Math.random() * 3) + 2;
      for (let r = 0; r < numRegs; r++) {
        const regPlayerId = Math.floor(Math.random() * 10) + 1;
        const regPaid = Math.random() < 0.5 ? 'paid' : 'unpaid';
        await run('INSERT INTO event_registrations (event_id, player_id, payment_status, status) VALUES (?, ?, ?, "registered")',
          [eventRes.insertId, regPlayerId, regPaid]);
      }

      // Mark slots as used if court is assigned
      if (eventForDate.court) {
        if (!usedSlots.has(eventForDate.court)) {
          usedSlots.set(eventForDate.court, new Set());
        }
        for (let h = startHour; h < endHour; h++) {
          usedSlots.get(eventForDate.court).add(h);
        }
      }
    }
    
    // Generate 2-4 reservations per day (not per court)
    const numReservations = Math.floor(Math.random() * 3) + 2; // 2-4
    
    for (let i = 0; i < numReservations; i++) {
      // Random court (1-5)
      let courtId, hour;
      let attempts = 0;
      
      // Find available slot
      do {
        courtId = Math.floor(Math.random() * 5) + 1;
        hour = Math.floor(Math.random() * 13) + 8; // 8am - 8pm
        
        if (!usedSlots.has(courtId)) {
          usedSlots.set(courtId, new Set());
        }
        
        attempts++;
        if (attempts > 50) break; // Prevent infinite loop
      } while (usedSlots.get(courtId).has(hour));

      if (attempts > 50) continue; // Skip if can't find slot

      usedSlots.get(courtId).add(hour);

      const start = `${dateStr} ${String(hour).padStart(2, '0')}:00`;
      const end = `${dateStr} ${String(hour + 1).padStart(2, '0')}:00`;
      
      // Random player 1-10
      const playerId = Math.floor(Math.random() * 10) + 1;
      const status = 'booked';
      const price = [100000, 150000, 200000][Math.floor(Math.random() * 3)];
      
      // Random payment status (60% paid)
      const isPaid = Math.random() < 0.6;
      const payStatus = isPaid ? 'paid' : 'unpaid';

      const res = await run('INSERT INTO reservations (court_id, player_id, start_time, end_time, status, price_cents, payment_status) VALUES (?,?,?,?,?,?,?)',
        [courtId, playerId, start, end, status, price, payStatus]);

      // Generate and update order_code using insertId
      const orderCode = '#' + String(res.insertId).padStart(6, '0');
      await run('UPDATE reservations SET order_code = ? WHERE id = ?', [orderCode, res.insertId]);

      // Log reservation creation
      console.log(`  ✓ Reservation ${orderCode}: Court ${courtId}, Player ${playerId}, ${dateStr} ${String(hour).padStart(2, '0')}:00, ${formatCurrency(price)}, ${payStatus}`);

      if (isPaid) {
        const methods = ['cash', 'card', 'transfer'];
        const method = methods[Math.floor(Math.random() * methods.length)];
        await run('INSERT INTO payments (player_id, amount_cents, currency, source_type, source_id, method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [playerId, price, 'VND', 'reservation', res.insertId, method, 'succeeded']);
        console.log(`    💰 Payment created: ${orderCode} → ${formatCurrency(price)} via ${method}`);
      }
    }

    loopDate.setDate(loopDate.getDate() + 1);
  }

  console.log('Database initialized successfully!');
  console.log('- 5 courts created');
  console.log('- Sample data from 2025-11-22 to 2025-12-05');
  console.log('- 2-4 reservations per day');
  console.log('- 5 events with registrations');
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