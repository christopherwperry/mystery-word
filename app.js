const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

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
  req.session.guesses = 8;
  guesses = req.session.guesses
  wordLetters = Array.from(req.session.word);
  points = 0;
  gameStart = true;
  letters = [];
  wordArray = [];
  for (let i = 0; i < wordLetters.length; i++){
    wordArray.push("");
  }
  res.render('index', {guesses, letters, wordArray, gameStart});
});

app.post('/', function(req, res){
    letterGuess = req.body.letter.toLowerCase();
    if (!letterGuess){
      authError = "Please enter a letter."
      res.render('index', {guesses, letters, wordArray, authError});
    } else {
      if (letters.indexOf(letterGuess) === -1){
        match = false;
        checkLetter();
        console.log(wordLetters);
        console.log(wordArray);
        letters.push(letterGuess);
        if (points === req.session.word.length){
          winner = "Winner, Winner!!";
          newGame = true;
          res.render('index', {winner, guesses, letters, wordArray, newGame});
        } else if (guesses === 0){
          authError = "You Lose!"
          newGame = true;
          missedLetters();
          res.render('index', {guesses, letters, wordArray, authError, newGame});
        } else {
          res.render('index', {guesses, letters, wordArray});
        }
      } else {
        authError = "Letter already guessed. Please try another!"
        res.render('index', {guesses, letters, wordArray, authError});
      }
    }
  });

app.post('/new', function(req, res){
  res.redirect('/')
});

function checkLetter(){
  for (let i = 0; i < wordLetters.length; i++){
    if (letterGuess === wordLetters[i]){
      match = true;
      points+=1;
      wordArray[i] = wordLetters[i];
    }
  };
  if (match === false){
    guesses-=1;
  };
  return wordArray;
  return guesses;
};

function missedLetters(){
  for (let i = 0; i < wordLetters.length; i++){
    if (wordArray[i] === ""){
      wordArray[i] = wordLetters[i];
    }
  }
  return wordArray;
}

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
