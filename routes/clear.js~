/*
 * GET request for converting
 */

var mongodb = require('mongojs');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost/mydb';

function clear(app) {
    app.get('/clear', function(req, res) {
	    var db = mongodb.connect(mongoUri, ['daily']);

	    if (req.query.name) {
		db.highscores.remove( {'name':req.query.name},
				      function() { res.end() });
	    }
	    if (req.query.score) {
		db.highscores.remove( {'score':parseInt(req.query.score)},
				      function() { res.end() });
	    }
	    // remove everything
	    if (!(req.query.name || req.query.score)) {
		db.highscores.remove(function() { res.end() });
	    }

	    var db = mongodb.connect(mongoUri, ['alltime']);

	    if (req.query.name) {
		db.highscores.remove( {'name':req.query.name},
				      function() { res.end() });
	    }
	    if (req.query.score) {
		db.highscores.remove( {'score':parseInt(req.query.score)},
				      function() { res.end() });
	    }
	    // remove everything
	    if (!(req.query.name || req.query.score)) {
		db.highscores.remove(function() { res.end() });
	    }
	});	
}    
	      

module.exports = clear;