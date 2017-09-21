const { Client } = require('pg');
function connectToDb() {
  const client = new Client({
    host: process.env.TELEGRAM_CONTEST_DB_HOST,
    database: process.env.TELEGRAM_CONTEST_DB_DATABASE,
    user: process.env.TELEGRAM_CONTEST_DB_USER,
    password: process.env.TELEGRAM_CONTEST_DB_PASSWORD,
    port: '5432',
    ssl: true,
  });
  return client;
}
function fetchParticipants() {
  const client = connectToDb();
  return client.connect().then(() => {
    return client.query('SELECT * FROM winners WHERE TRUE').then((response) => {
      client.end();
      return response.rows;
    });
  });
}
function addParticipant(from, answers, correctAnswers) {
  const client = connectToDb();
  client.connect().then(() => {
    client.query({
      text: 'INSERT INTO winners(telegram_id, first_name, last_name, username, answers, correct_answers) VALUES($1, $2, $3, $4, $5, $6)',
      values: [from.id, from.first_name, from.last_name, from.username, JSON.stringify(answers), correctAnswers],
    })
      .then(() => {
        client.end();
      });
  });
}
function updateAnswers(id, answers, correctAnswers) {
  const client = connectToDb();
  client.connect().then(() => {
    client.query({
      text: 'UPDATE winners SET answers = $1, correct_answers = $2 WHERE telegram_id = $3',
      values: [ JSON.stringify(answers), correctAnswers, id ],
    })
      .then(() => {
        client.end();
      });
  });
}

module.exports = {
  connectToDb,
  fetchParticipants,
  addParticipant,
  updateAnswers,
};
