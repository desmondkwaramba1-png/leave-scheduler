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
module.exports = router;