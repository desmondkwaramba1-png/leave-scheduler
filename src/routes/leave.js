const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const {
    isWorkingDay,
    getWorkingDaysInRange,
    checkCapacityForDate,
    checkOverlap
} = require('../services/leaveRules');
router.post('/', (req, res) => {
    const { employeeId, startDate, endDate } = req.body;

    if (!employeeId || !startDate || !endDate) {
        return res.status(400).json({ error: 'employeeId, startDate, and endDate are required' });
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    const workingDays = getWorkingDaysInRange(startDate, endDate);

    if (workingDays.length === 0) {
        return res.status(400).json({ error: 'Request contains no working days' });
    }

    if (checkOverlap(db, employeeId, startDate, endDate)) {
        return res.status(409).json({ error: 'This request overlaps an existing pending or approved request' });
    }

    const teamSize = db.prepare('SELECT COUNT(*) as count FROM employees WHERE team_id = ?').get(employee.team_id).count;

    for (const day of workingDays) {
        if (isWorkingDay(day)) {
            const hasCapacity = checkCapacityForDate(db, employee.team_id, day, teamSize);
            if (!hasCapacity) {
                return res.status(409).json({ error: `Team capacity exceeded on ${day}` });
            }
        }
    }

    const result = db.prepare(`
    INSERT INTO leave_requests (employee_id, start_date, end_date, status)
    VALUES (?, ?, ?, 'pending')
  `).run(employeeId, startDate, endDate);

    res.status(201).json({ id: result.lastInsertRowid, employeeId, startDate, endDate, status: 'pending' });
});

//approve/reject endpoint
router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    const leaveRequest = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);

    if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
        return res.status(409).json({ error: `This request is already ${leaveRequest.status}` });
    }

    db.prepare('UPDATE leave_requests SET status = ? WHERE id = ?').run(status, id);

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    res.json(updated);
});
//listing leave for the next 30 days. This is what the calendar/list view in the frontend will use.
router.get('/', (req, res) => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 30);
    const endDate = future.toISOString().split('T')[0];

    const requests = db.prepare(`
    SELECT
      leave_requests.id,
      leave_requests.start_date,
      leave_requests.end_date,
      leave_requests.status,
      employees.name as employee_name,
      teams.name as team_name
    FROM leave_requests
    JOIN employees ON leave_requests.employee_id = employees.id
    JOIN teams ON employees.team_id = teams.id
    WHERE leave_requests.start_date <= ?
      AND leave_requests.end_date >= ?
    ORDER BY leave_requests.start_date ASC
  `).all(endDate, startDate);

    res.json(requests);
});
module.exports = router;