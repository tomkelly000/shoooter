var mongodb = require('mongojs');
var mongoUri = 'mongodb://localhost/mydb';
var db = mongodb.connect(mongoUri, ['highscores']);
var c = db.highscores.find().sort({score:1}).limit(1, function(err, cursor) 
{
    console.log(cursor);
    cursor.forEach(function(score) {console.log(score.score)});
});
/*
console.log(cursor);
console.log('asdf')
console.log(cursor.next());*/