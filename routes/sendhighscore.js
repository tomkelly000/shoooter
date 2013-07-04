/*
 * GET request for updating high score
 */

function sendhighscore(app, leaderboard, req, res) {
    leaderboard.post(parseInt(req.query.score), 
		     {'name':req.query.name},
		     function(err, score) {
			 res.end();
			     });
}

module.exports = sendhighscore;