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
module.exports = { isWorkingDay, getWorkingDaysInRange };