'use strict';

const express = require('express');

const app = express();

app.set('port', (process.env.PORT || 5000));

const TBot = require('node-telegram-bot-api');
// const telegram = new TBot(process.env.TELEGRAM_CONTEST_TOKEN, { polling: true });
//
// telegram.on('text', (message) => {
//   telegram.sendMessage(message.chat.id, 'test');
// });

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

app.get('/', function (req, res) {
  const client = connectToDb();
  client.connect().then(() => {
    client.query('SELECT * FROM winners WHERE TRUE').then((response) => {
      res.send(JSON.stringify(response));
    });
  });
});

app.listen(app.get('port'), function () {
  console.log('Contest app is running on port', app.get('port'));
});

function testDB() {
  const client = connectToDb();
  client.connect().then(() => {
    client.query('SELECT * FROM winners WHERE TRUE').then((response) => {
      console.log('select success');
    });
    client.query({
      text: 'INSERT INTO winners(name, email) VALUES($1, $2)',
      values: ['brianc', 'brian.m.carlson@gmail.com'],
    }).then(() => {
      client.end();
    });
  });
}

testDB();
