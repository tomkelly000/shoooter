/*
 * GET request for getting the high scores
 */

function gethighscores(app, leaderboard, req, res) {
    leaderboard.get(function(err, scores) {
	    res.end(JSON.stringify({'scores':scores}));
	});
}

module.exports = gethighscores;