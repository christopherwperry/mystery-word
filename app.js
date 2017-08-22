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
let wordLetters;

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
  console.log(req.session.word);
  console.log(req.session);
  console.log(wordLetters);
  res.render('index', {guesses: guesses, letters: letters, wordLetters});
});

app.post('/', function(req, res){
  let letterGuess = req.body.letter;
  if (letterGuess === ""){
    res.render('index', {guesses: guesses, letters: letters, wordLetters});
  } else {
    let letterCheck = letters.indexOf(letterGuess);
    if (letterCheck === -1){
      console.log(letterCheck);
      letters.push(letterGuess);
      guesses = guesses - 1;
      console.log(letterGuess);
      console.log(letters)
      res.render('index', {guesses: guesses, letters: letters, wordLetters});
    } else {
      //TODO figure out alert/error message for a duplicate letter being guessed.
      res.render('index', {guesses: guesses, letters: letters, wordLetters})
    }
  }
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
