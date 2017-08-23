const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let guesses = 8;
let letters = [];
let match = false;
let wordLetters;
let letterGuess;
let wordArray;
let letter;

app.use(express.static(__dirname + '/public'));
app.engine('mustache', mustache());
app.set('views', ['./views']);
app.set('view engine', 'mustache');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(session({
  secret: 'mystery',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res){
  req.session.word = words[Math.floor(Math.random() * words.length)];
  wordLetters = Array.from(req.session.word);
  guesses = 8;
  letters = [];
  wordArray = [];
  for (let i = 0; i < wordLetters.length; i++){
    wordArray.push("");
  }
  console.log(req.session.word);
  console.log(req.session);
  console.log(wordLetters);
  console.log(wordArray);
  res.render('index', {guesses: guesses, letters: letters, wordArray});
});

app.post('/', function(req, res){
  letterGuess = req.body.letter;
  console.log(letterGuess);
    if (letterGuess === ""){
      res.render('index', {guesses: guesses, letters: letters, wordArray});
    } else {
      let letterCheck = letters.indexOf(letterGuess);
      if (letterCheck === -1){
        console.log(match);
        checkLetter();
        console.log(match);
        letters.push(letterGuess);
        guesses = guesses - 1;
        if (guesses === 0){
          res.render('index');
        } else {
          res.render('index', {guesses: guesses, letters: letters, wordArray});
        }
      }
    }
  });

function checkLetter(){
  for (let i = 0; i < wordLetters.length; i++){
    if (letterGuess === wordLetters[i]){
      match = true;
      letter = wordLetters[i];
      wordArray[i] = letter;
    }
  };
  return wordArray;
}

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
