var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

var db

mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
});

//app.listen(port, () => {
// MongoClient.connect(configDB.url, { useNewUrlParser: true }, (error, client) => {
//     if(error) {
//         throw error;
//     }
//     db = client.db(configDB.dbName);
//     console.log("Connected to `" + configDB.dbName + "`!");
//     require('./app/routes.js')(app, passport, db);
// });
//});

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs');

app.use(session({
  secret: 'rcbootcamp2019a',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.listen(port);
console.log('The magic happens on port ' + port);
