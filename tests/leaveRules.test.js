const Database = require('better-sqlite3');
const { getTeamLeaveLimit, checkCapacityForDate, checkOverlap } = require('../src/services/leaveRules');

let db;

beforeEach(() => {
    db = new Database(':memory:');

    db.exec(`
    CREATE TABLE teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_id INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
  `);
});

describe('30% capacity rule', () => {
    test('getTeamLeaveLimit rounds down correctly', () => {
        expect(getTeamLeaveLimit(7)).toBe(2);
        expect(getTeamLeaveLimit(5)).toBe(1);
        expect(getTeamLeaveLimit(3)).toBe(0);
    });

    test('checkCapacityForDate allows leave when under the limit', () => {
        db.prepare('INSERT INTO teams (id, name) VALUES (1, ?)').run('Engineering');
        db.prepare('INSERT INTO employees (id, name, team_id) VALUES (1, ?, 1)').run('Tariro Moyo');

        const result = checkCapacityForDate(db, 1, '2026-07-01', 7);
        expect(result).toBe(true);
    });

    test('checkCapacityForDate blocks leave when at the limit', () => {
        db.prepare('INSERT INTO teams (id, name) VALUES (1, ?)').run('Engineering');
        db.prepare('INSERT INTO employees (id, name, team_id) VALUES (1, ?, 1)').run('Tariro Moyo');
        db.prepare('INSERT INTO employees (id, name, team_id) VALUES (2, ?, 1)').run('Tinashe Chikafu');

        db.prepare(`INSERT INTO leave_requests (employee_id, start_date, end_date, status) VALUES (1, ?, ?, ?)`)
            .run('2026-07-01', '2026-07-01', 'approved');
        db.prepare(`INSERT INTO leave_requests (employee_id, start_date, end_date, status) VALUES (2, ?, ?, ?)`)
            .run('2026-07-01', '2026-07-01', 'approved');

        const result = checkCapacityForDate(db, 1, '2026-07-01', 7);
        expect(result).toBe(false);
    });
});
describe('overlap rule', () => {
    beforeEach(() => {
        db.prepare('INSERT INTO teams (id, name) VALUES (1, ?)').run('Engineering');
        db.prepare('INSERT INTO employees (id, name, team_id) VALUES (1, ?, 1)').run('Tariro Moyo');

        db.prepare(`INSERT INTO leave_requests (employee_id, start_date, end_date, status) VALUES (1, ?, ?, ?)`)
            .run('2026-07-10', '2026-07-15', 'pending');
    });

    test('detects an overlapping request', () => {
        const result = checkOverlap(db, 1, '2026-07-12', '2026-07-18');
        expect(result).toBe(true);
    });

    test('allows a non-overlapping request', () => {
        const result = checkOverlap(db, 1, '2026-07-20', '2026-07-22');
        expect(result).toBe(false);
    });

    test('detects an overlap that touches the exact boundary', () => {
        const result = checkOverlap(db, 1, '2026-07-15', '2026-07-16');
        expect(result).toBe(true);
    });

    test('blocks overlap even when existing request is only pending, not approved', () => {
        const result = checkOverlap(db, 1, '2026-07-11', '2026-07-11');
        expect(result).toBe(true);
    });
});