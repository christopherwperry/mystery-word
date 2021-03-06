const express = require('express');
const mustache = require('mustache-express');
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const fs = require('fs');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoURL = 'mongodb://localhost:27017/newdb';
const words = require('an-array-of-english-words');
// const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
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
  if (element.length >= 8){
    return (element);
  };
});

app.use(express.static(__dirname + '/public'));
app.engine('mustache', mustache());
app.set('views', ['./views']);
app.set('view engine', 'mustache');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieSession({
  name: 'session',
  keys: [ 'key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use('/winners', function (req, res) {
  MongoClient.connect(mongoURL, function (err, db) {
    const winners = db.collection('winners');
    winners.find({}).toArray(function (err, users) {
      res.render("winners", {winners: users})
    })
  })
})

app.get('/', function(req, res){
  res.render('index')
});

app.get('/newgame', function(req, res){
  if(req.session.difficulty){
    if(req.session.easy){
    req.session.word = easyWords[Math.floor(Math.random() * easyWords.length)];
    }
    if(req.session.normal){
    req.session.word = normalWords[Math.floor(Math.random() * normalWords.length)];
    }
    if (req.session.hard){
    req.session.word = hardWords[Math.floor(Math.random() * hardWords.length)];
    }
    req.session.easy = false;
    req.session.normal = false;
    req.session.hard = false;
    req.session.difficulty = null;
    req.session.guesses = 8;
    guesses = req.session.guesses
    wordLetters = Array.from(req.session.word);
    points = 0;
    gameStart = true;
    letters = [];
    wordArray = [];
    for (let i = 0; i < wordLetters.length; i++){
      wordArray.push({letter: "", color: "black"});
    }
    console.log(wordArray);
    console.log(wordLetters);
    res.render('game', {guesses, letters, wordArray: wordArray, gameStart});
  } else {
    res.redirect('/')
  }
});

app.post('/easy', function(req, res){
  req.session.difficulty = true;
  req.session.easy = true
  res.redirect('/newgame')
});

app.post('/normal', function(req, res){
  req.session.difficulty = true;
  req.session.normal = true;
  res.redirect('/newgame')
});

app.post('/hard', function(req, res){
  req.session.difficulty = true;
  req.session.hard = true;
  res.redirect('/newgame')
});

app.post('/win', function(req, res){
  MongoClient.connect(mongoURL, function (err, db) {
    const winners = db.collection('winners');
    winners.insert({"name": req.body.name, "picture": req.body.pic});
    res.redirect('/winners');
  })
})

app.post('/newgame', function(req, res){
    letterGuess = req.body.letter.toLowerCase();
    authError = null;
    newMatch = null;
    if (!letterGuess){
      authError = "Please enter a letter."
      res.render('game', {guesses, letters, wordArray: wordArray, authError});
    } else if (req.checkBody('letter', 'Invalid letter').isAlpha().validationErrors[0]) {
      authError = "Invalid Entry. Please enter a letter."
      res.render('game', {guesses, letters, wordArray: wordArray, authError});
    } else {
      if (letters.includes(letterGuess)){
        authError = "Letter already guessed. Please try another!"
        res.render('game', {guesses, letters, wordArray: wordArray, authError});
      } else {
        match = false;
        checkLetter();
        letters.push(letterGuess);
        if (points === req.session.word.length){
          winner = "Winner, Winner!!";
          newGame = true;
          res.render('game', {winner, guesses, letters, wordArray: wordArray, newGame});
        } else if (guesses === 0){
          authError = "You Lose!"
          newGame = true;
          missedLetters();
          res.render('game', {guesses, letters, wordArray: wordArray, authError, newGame});
        } else {
          res.render('game', {guesses, letters, wordArray: wordArray, authError, newMatch});
        }}}});

app.post('/new', function(req, res){
  res.redirect('/');
});

app.post('/difficulty'), function(req, res){
  res.redirect('/');
}

function checkLetter(){
  for (let i = 0; i < wordLetters.length; i++){
    if (letterGuess === wordLetters[i]){
      match = true;
      points++;
      wordArray[i].letter = wordLetters[i];
      newMatch = true;}
    }
  if (match === false){
    guesses--;
    authError = "No match here! Guess again."
}};

function missedLetters(){
  for (let i = 0; i < wordLetters.length; i++){
    if (wordArray[i].letter === ""){
      wordArray[i].letter = wordLetters[i];
      wordArray[i].color= "red";
}}};

app.listen(process.env.PORT || 5000)
