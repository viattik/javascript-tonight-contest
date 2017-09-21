'use strict';

const express = require('express');
const { fetchParticipants, addParticipant, updateAnswers } = require('./db');
const { questions, correctAnswers } = require('./questions');

const app = express();

app.set('port', (process.env.PORT || 5000));

const TBot = require('node-telegram-bot-api');
const telegram = new TBot(process.env.TELEGRAM_CONTEST_TOKEN, { polling: true });

let participants = {};

function registerParticipant(from) {
  const id = from.id;
  if (!participants[id]) {
    participants[id] = {
      from,
      answers: [],
    };
    addParticipant(from, [], 0);
  }
}
function getParticipantAnswers(id) {
  return participants[id].answers;
}
function getReply(id) {
  const answers = getParticipantAnswers(id);
  if (answers.length === 3) {
    return {
      reply: `Thank you for participation.
The winner will be defined after the last talk.
And we also remind you that there will be an after-party, so it worth waiting.`,
      form: { parse_mode: 'Markdown' },
    };
  }
  const questionNumber = answers.length;
  const question = questions[questionNumber];
  return {
    reply: question.text,
    form: {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: question.answers.map((a, answerNumber) => {
          return [ { text: a.text, callback_data: `${questionNumber}:${answerNumber}` } ]
        }),
        resize_keyboard: true,
        one_time_keyboard: true,
        force_reply: true,
      },
    }
  };
}
function addAnswer(id, data) {
  const [ questionNumber, answerNumber ] = data.split(':');
  participants[id].answers[questionNumber] = Number(answerNumber);
  const corrects = participants[id].answers.reduce((n, answer, i) => {
    return answer === correctAnswers[i] ? n + 1 : n;
  }, 0);
  updateAnswers(id, participants[id].answers, corrects);
}
function getRenderedAnswers(items) {
  return items
    .map((item) => (
      `${item.telegram_id}: ${item.first_name} ${item.last_name} (@${item.username}), ${item.correct_answers} correct answers`
    ))
    .join('<br />');
}

app.get('/', function (req, res) {
  fetchParticipants().then((items) => {
    const result = `
      <b>3 correct answers:</b><br/>
      ${getRenderedAnswers(items.filter((item) => item.correct_answers === 3))}
      <br/><br/><b>2 correct answers:</b><br/>
      ${getRenderedAnswers(items.filter((item) => item.correct_answers === 2))}
      <br/><br/><b>1 correct answers:</b><br/>
      ${getRenderedAnswers(items.filter((item) => item.correct_answers === 1))}
    `;
    res.send(result);
  })
});



telegram.on('text', (message) => {
  const { from, chat, text } = message;
  console.log(`Got text message from ${from.first_name} ${from.last_name}: ${text}`);
  registerParticipant(from);
  const { reply, form } = getReply(chat.id);
  telegram.sendMessage(message.chat.id, reply, form);
});

telegram.on('callback_query', (query) => {
  const { message, data, from } = query;
  console.log(`Got answer message from ${from.first_name} ${from.last_name}: ${data}`);
  registerParticipant(from);
  addAnswer(from.id, data);
  const { reply, form } = getReply(from.id);
  telegram.editMessageText(
    reply,
    Object.assign(
      form,
      { chat_id: message.chat.id, message_id: message.message_id }
    )
  );
});

app.listen(app.get('port'), function () {
  console.log('Contest app is running on port', app.get('port'));
});


fetchParticipants().then((items) => {
  items.forEach((item) => {
    participants[item.telegram_id] = {
      id: item.telegram_id,
      first_name: item.first_name,
      last_name: item.last_name,
      username: item.username,
      answers: JSON.parse(item.answers),
    }
  });
  console.log('DB loaded');
});
