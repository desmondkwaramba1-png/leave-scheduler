const holidays = require('../data/public_holidays.json');

function isWorkingDay(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getUTCDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateString);

    return !isWeekend && !isHoliday;
}

module.exports = { isWorkingDay };