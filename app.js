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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(session({
  secret: 'mystery',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res){
  let todaysWord = words[Math.floor(Math.random() * words.length)];
  console.log(todaysWord);
  res.render('index');
});

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
