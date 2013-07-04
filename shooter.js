var express = require('express');
var Leaderboard = require('../mongoleaderboard');
var app = express();

app.configure(function() {
	app.use(express.static('static'));
    });

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/shooter';


var daily = new Leaderboard(mongoUri, {'collection':'daily',
				       'duration':1000 * 60 * 60 * 24});

var alltime = new Leaderboard(mongoUri, {'collection':'alltime',
					 'page_size':20,
					 'num_pages':1});

var check = require('./routes/checkhighscore');
var send = require('./routes/sendhighscore');
var get = require('./routes/gethighscores');

// redirects 
app.get('/checkalltime', function(req, res) {
	check(app, alltime, req, res);
    });
app.get('/sendalltime', function(req, res) {
	send(app, alltime, req, res);
    });
app.get('/getalltime', function(req, res) {
	get(app, alltime, req, res);
    });

app.get('/checkdaily', function(req, res) {
	check(app, daily, req, res);
    });
app.get('/senddaily',function(req, res) {
	send(app, daily, req,res);
    });
app.get('/getdaily', function(req, res) {
	get(app, daily, req, res);
    });

require('./routes/clear')(app);

var port = process.env.PORT || 5001;
app.listen(port, function() {
	console.log("Listening on " + port);
    });