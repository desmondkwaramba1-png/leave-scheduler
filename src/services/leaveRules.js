const holidays = require('../data/public_holidays.json');

function isWorkingDay(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getUTCDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateString);

    return !isWeekend && !isHoliday;
}
function getWorkingDaysInRange(startDate, endDate) {
    const days = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        const dateString = current.toISOString().split('T')[0];

        const dayOfWeek = current.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (!isWeekend) {
            days.push(dateString);
        }

        current.setUTCDate(current.getUTCDate() + 1);
    }

    return days;
}
function getTeamLeaveLimit(teamSize) {
    return Math.floor(teamSize * 0.3);
}
function checkCapacityForDate(db, teamId, date, teamSize) {
    const limit = getTeamLeaveLimit(teamSize);

    const countOnLeave = db.prepare(`
    SELECT COUNT(*) as count
    FROM leave_requests
    JOIN employees ON leave_requests.employee_id = employees.id
    WHERE employees.team_id = ?
      AND leave_requests.status = 'approved'
      AND ? BETWEEN leave_requests.start_date AND leave_requests.end_date
  `).get(teamId, date).count;

    return countOnLeave < limit;
}
function checkOverlap(db, employeeId, startDate, endDate) {
    const overlapping = db.prepare(`
    SELECT COUNT(*) as count
    FROM leave_requests
    WHERE employee_id = ?
      AND status IN ('pending', 'approved')
      AND start_date <= ?
      AND end_date >= ?
  `).get(employeeId, endDate, startDate).count;

    return overlapping > 0;
}
module.exports = { isWorkingDay, getWorkingDaysInRange, getTeamLeaveLimit, checkCapacityForDate, checkOverlap };