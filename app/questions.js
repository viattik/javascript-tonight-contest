module.exports.questions = [
  {
    text: `Hi. You will need to answer 3 JS-related questions.
They may be frustrating a little bit, but give it a shot.
Here is the first one:
\`\`\`
const a = [,,,]; 
a.toString(); // - ?
\`\`\``,
    answers: [
      { text: '‘ ’' },
      { text: '‘[object object]’' },
      { text: '‘,,’', isCorrect: true },
    ]
  },
  {
    text: `What about this one?
\`\`\`
444 + '333' - true
\`\`\``,
    answers: [
      { text: '444332', isCorrect: true },
      { text: '776' },
      { text: 'Error' },
    ]
  },
  {
    text: `And the last one:
\`\`\`
'b' + 'a' + + 'a' + 'a'
\`\`\``,
    answers: [
      { text: '’baaa’' },
      { text: '‘baNaNa’', isCorrect: true },
      { text: '’baNaNNaN’' },
    ]
  },
];

module.exports.correctAnswers = [ 2, 0, 1 ];
