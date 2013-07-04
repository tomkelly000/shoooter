/*
 * GET request for converting
 */

var mongodb = require('mongojs');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/mydb';

function convert(app) {
    app.get('/convert', function(req, res) {
	    var db = mongodb.connect(mongoUri, ['highscores']);

	    db.highscores.remove({score: {$lt:39497}}, function() { res.end()});
	});	
}    
	      

module.exports = convert;