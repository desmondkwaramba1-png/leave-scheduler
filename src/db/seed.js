const db = require('./schema');

db.exec('DELETE FROM leave_requests');
db.exec('DELETE FROM employees');
db.exec('DELETE FROM teams');
const insertTeam = db.prepare('INSERT INTO teams (name) VALUES (?)');

const engineeringId = insertTeam.run('Engineering').lastInsertRowid;
const operationsId = insertTeam.run('Operations').lastInsertRowid;
const financeId = insertTeam.run('Finance').lastInsertRowid;
const insertEmployee = db.prepare('INSERT INTO employees (name, team_id) VALUES (?, ?)');

const engineeringNames = ['Tariro Moyo', 'Tinashe Chikafu', 'Rumbidzai Mhini', 'Farai Dube', 'Nyasha Banda', 'Tatenda Gumbo', 'Chiedza Ncube'];
const operationsNames = ['Vimbai Sithole', 'Takudzwa Mlambo', 'Rutendo Mukamuri', 'Blessing Chivasa', 'Anesu Marufu'];
const financeNames = ['Kudzai Chando', 'Shamiso Mutema', 'Tafadzwa Zinyemba'];

engineeringNames.forEach(name => insertEmployee.run(name, engineeringId));
operationsNames.forEach(name => insertEmployee.run(name, operationsId));
financeNames.forEach(name => insertEmployee.run(name, financeId));

console.log('Seed complete: 3 teams, 15 employees inserted.');