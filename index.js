'use strict';

const express = require('express');

const app = express();

app.set('port', (process.env.PORT || 5000));

const ENV = process.env.TELEGRAM_CONTEST_ENV || 'development';

app.get('/', function (req, res) {
  res.send('Nothing is here');
  res.end();
});

app.listen(app.get('port'), function () {
  console.log('Contest app is running on port', app.get('port'));
});

const { Client } = require('pg');
const dbConfig = ENV === 'development'
  ? {
    host: process.env.TELEGRAM_CONTEST_DB_HOST,
    database: process.env.TELEGRAM_CONTEST_DB_DATABASE,
    user: process.env.TELEGRAM_CONTEST_DB_USER,
    password: process.env.TELEGRAM_CONTEST_DB_PASSWORD,
    port: '5432',
    ssl: true,
  }
  : undefined;
const client = new Client(dbConfig);

client.connect().then(() => {
  client.query('SELECT * FROM winners WHERE TRUE').then((response) => {
    console.log(response);
  });
  client.query({
    text: 'INSERT INTO winners(name, email) VALUES($1, $2)',
    values: ['brianc', 'brian.m.carlson@gmail.com'],
  }).then(() => {
    client.end();
  });
});


const TBot = require('node-telegram-bot-api');
const telegram = new TBot(process.env.TELEGRAM_CONTEST_TOKEN, { polling: true });

telegram.on('text', (message) => {
  telegram.sendMessage(message.chat.id, 'test');
});
