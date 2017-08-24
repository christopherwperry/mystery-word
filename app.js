const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const easyWords = words.filter(function(element) {
  if (element.length < 7 && element.length > 3){
    return (element);
  }
});
const normalWords = words.filter(function(element) {
  if (element.length < 9 && element.length > 5){
    return (element);
  }
});
const hardWords = words.filter(function(element) {
  if (element.length > 8){
    return (element);
  };
});

let winners = ["Chris", "Chris", "Chris"];

app.use(express.static(__dirname + '/public'));
app.engine('mustache', mustache());
app.set('views', ['./views']);
app.set('view engine', 'mustache');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(session({
  secret: 'mystery men',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res){
  res.render('index')
});

app.get('/newgame', function(req, res){
  if(req.session.difficulty){
    req.session.word = words[Math.floor(Math.random() * words.length)];
    req.session.difficulty = null;
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
    res.render('game', {guesses, letters, wordArray, gameStart});
  } else {
    res.redirect('/')
  }
});

app.get('/winners', function(req, res){
  res.render('winners', {winners});
});

app.post('/', function(req, res){
  difficulty = req.body.difficulty;
  req.session.difficulty = difficulty;
  console.log(difficulty);
  res.redirect('/newgame')
});

app.post('/newgame', function(req, res){
    letterGuess = req.body.letter.toLowerCase();
    authError = null;
    newMatch = null;
    if (!letterGuess){
      authError = "Please enter a letter."
      res.render('game', {guesses, letters, wordArray, authError});
    } else if (req.checkBody('letter', 'Invalid letter').isAlpha().validationErrors[0]) {
      authError = "Invalid Entry. Please enter a letter."
      res.render('game', {guesses, letters, wordArray, authError});
    } else {
      if (letters.includes(letterGuess)){
        authError = "Letter already guessed. Please try another!"
        res.render('game', {guesses, letters, wordArray, authError});
      } else {
        match = false;
        checkLetter();
        console.log(wordLetters);
        console.log(wordArray);
        letters.push(letterGuess);
        if (points === req.session.word.length){
          winner = "Winner, Winner!!";
          newGame = true;
          res.render('game', {winner, guesses, letters, wordArray, newGame});
        } else if (guesses === 0){
          authError = "You Lose!"
          newGame = true;
          missedLetters();
          res.render('game', {guesses, letters, wordArray, authError, newGame});
        } else {
          res.render('game', {guesses, letters, wordArray, authError, newMatch});
        }
      }
    }
  });

app.post('/new', function(req, res){
  res.redirect('/');
});

app.post('/poop'), function(req, res){
  res.redirect('/');
}

function checkLetter(){
  for (let i = 0; i < wordLetters.length; i++){
    if (letterGuess === wordLetters[i]){
      match = true;
      points+=1;
      wordArray[i] = wordLetters[i];
      newMatch = true;
    }
  };
  if (match === false){
    guesses-=1;
    authError = "No match here! Guess again."
  };
};

function missedLetters(){
  for (let i = 0; i < wordLetters.length; i++){
    if (wordArray[i] === ""){
      wordArray[i] = wordLetters[i];
    }
  }
}

app.listen(3000, function(){
  console.log("Server running on port 3000");
});

// if(req.session.difficulty === easy){
// req.session.word = easyWords[Math.floor(Math.random() * easyWords.length)];
// console.log("easy");
// } else if (req.session.difficulty === normal) {
// req.session.word = normalWords[Math.floor(Math.random() * normalWords.length)];
// console.log("normal");
// } else {
// req.session.word = hardWords[Math.floor(Math.random() * hardWords.length)];
// console.log("hard");
// }

// if (difficulty === easy){
//   data = easyWords;
//   console.log("easy");
//   console.log(data);
// } else if (difficulty === normal){
//   data = normalWords;
//   console.log("normal");
// } else {
//   data = hardWords;
//   console.log("hard");
// }
