/*
 * GET request for checking high score
 */

function checkhighscore(app, leaderboard, req, res) {
    leaderboard.check(parseInt(req.query.score), 
		      function(bool) { 
			  res.end(bool.toString());
		      });
}

module.exports = checkhighscore;