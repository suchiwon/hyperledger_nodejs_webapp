var express = require('express');
var url = require('url');
var fs = require('fs');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');

var app = express();

var jsonrpc = require('./js/jsonrpc');
var crypto = require('./js/crypto');

var mongoDB = require('./js/mongoDB');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('jsp', require('ejs').renderFile);

app.set('layout','layout');
app.use(expressLayouts);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(session({
	secret: '@#@SIGN#@#',
	resave: false,
	saveUninitialized: true
}));

app.use('/upload', express.static('uploads'));

var router = require('./router/main')(app, fs, jsonrpc, crypto, mongoDB);
var filesRouter = require("./router/files")(app, fs, jsonrpc, crypto, mongoDB);

//app.use('/', router);
//app.use('/upload', uploadRouter);

var server = app.listen(3000, function() {
    console.log("Server is running port 3000");
})
