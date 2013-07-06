// global variables
var balls = {
    'R' : 8,
    'bullet_R' : 2,
    'speed' : 4,
    'bullet_speed' : 10,
    'controls' : {
        'left' : false,
        'right' : false,
        'up' : false,
        'down' : false,
        'paused' : false
    },
    'lastAdd' : 0,
    'ballsAdded' : 0,
    'addRate' : .8,
    'bganim' : true,
    'mouseX' : 0,
    'mouseY' : 0,
    'turretLength' : 12,
    'shoot' : false,
    'cocked' : true,
    'fr' : 17, // framerate
    'velocitymap' : [ // maps 9 possible locations for ball to move to velocities
        // left xdir
        [[-Math.SQRT2/2, -Math.SQRT2/2], [-1, 0], [-Math.SQRT2/2, Math.SQRT2/2]],
        // no xdir
        [[0, -1], [0, 0], [0, 1]],
        // right xdir
        [[Math.SQRT2/2, -Math.SQRT2/2], [1, 0], [Math.SQRT2/2, Math.SQRT2/2]]
    ]
};

// configure mouse for aiming and shooting when the DOM tree is ready
$(document).ready(function() {
    $('#myCanvas').mousemove(aim);
    var canvas = document.getElementById('myCanvas');
    canvas.style.cursor = 'crosshair';

    // also prevent default highlighting for double click because it is annoying
    $('#myCanvas').dblclick(function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $('#myCanvas').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $('body').mousedown(function(e) {
        return false;
    });
});

// helper function for getting mouse coordinates from with parent
function getMouseCoords(parent, event) {
    var x = event.pageX - parent.offsetLeft;
    var y = event.pageY - parent.offsetTop;
    return [x, y];
}
// event handler for mouse moving
// sets the angle for the turret
function aim(e) {
    var mouse = getMouseCoords(this, e);
    balls.mouseX = mouse[0];
    balls.mouseY = mouse[1];   
}

// place an enemy ball somewhere randomly on the canvas
function createBall(canvas) {
    var x = Math.floor(Math.random() * (canvas.width - 2 * balls.R)) + balls.R;
    var y = Math.floor(Math.random() * (canvas.height - 2 * balls.R)) + balls.R;
    var theta = 2 * Math.random() * Math.PI;
    var vx = balls.speed * Math.cos(theta);
    var vy = balls.speed * Math.sin(theta);
    return {
        'x':x,
        'y':y,
        'vx':vx,
        'vy':vy,
        'time' : 0, // updated by frame rate now
        'hidden' : false, // starts out blinking
        'xflip' : false, // when flipping
        'yflip' : false,
        'x1' : x, // coordinates of duplicate if flipping
        'y1' : y
    }
}

// move the ball according to its velocity, flipping if necessary
function moveBall(ball, canvas) {
    ball.time += balls.fr; // add the time for a single frame
    // blinking stage
    if (ball.time <= 1000) { 
        if (Math.floor(ball.time / 100) % 2 == 1) {
            ball.hidden = true;
        } else {
            ball.hidden = false;
        }
    }
                
    // moving stage
    else {
        ball.hidden = false;
        ball.x += ball.vx;
        ball.x1 += ball.vx;
        ball.y += ball.vy;
        ball.y1 += ball.vy;
        // deal with x-coordinate
        if (!ball.xflip) {
            if (ball.x + balls.R >= canvas.width) {
                ball.x1 = ball.x; // save old coordinate
                ball.x -= canvas.width; // flip across screen
                ball.xflip = true;
            } else if (ball.x - balls.R <= 0) {
                ball.x1 = ball.x;
                ball.x += canvas.width;
                ball.xflip = true;
            }   
        } else {
            // ball is flipping
            // unflip when it's back on screen
            if (ball.x + balls.R < canvas.width && 
                ball.x - balls.R > 0) {
                    ball.xflip = false;
            }
        }
        // deal with y-coordinate
        if (!ball.yflip) {
            if (ball.y + balls.R >= canvas.height) {
                ball.y1 = ball.y; // save old coordinate
                ball.y -= canvas.height; // flip across screen
                ball.yflip = true;
            } else if (ball.y - balls.R <= 0) {
                ball.y1 = ball.y;
                ball.y += canvas.height;
                ball.yflip = true;
            }
        } else {
            // ball is flipping
            // unflip when it's back on screen
            if (ball.y + balls.R < canvas.height && 
                ball.y - balls.R > 0) {
                    ball.yflip = false;
            }
        }
    }
}

// move the bullet according to its velocity
function moveBullet(bullet, canvas) {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
}
    
// draw a circle with color at the x, y position on context             
function drawCircle(x, y, color, context, R) {
    context.beginPath();
    context.arc(x, y, R, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.closePath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
}

// draw a line from x1, y1 to x2, y2 with color on context
function drawLine(x1, y1, x2, y2, color, context) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.stroke();
}
     
// draw the ball on the context with color        
function drawBall(ball, context, color) {
    drawCircle(ball.x, ball.y, color, context, balls.R)
    if (ball.xflip) {
        drawCircle(ball.x1, ball.y, color, context, balls.R);
    }
    if (ball.yflip) {
        drawCircle(ball.x, ball.y1, color, context, balls.R);
    }
    if (ball.xflip && ball.yflip) {
        drawCircle(ball.x1, ball.y1, color, context, balls.R);
    }
}

// draw the bullet on the context with color
function drawBullet(bullet, context, color) {
    drawCircle(bullet.x, bullet.y, color, context, balls.bullet_R);
}

// draw the turret on top of player
function drawTurrets(player, context) {
    var p0 = player[0];
    player.forEach(function(p) {
        var normturret = getNormalizedTurretOffset(p0);
        var run = normturret[0];
        var rise = normturret[1];
        drawCircle(p.x - run * balls.R / 2, p.y - rise * balls.R / 2, // draw turret head on back edge of player
                  '#111', context, balls.R / 2);
        var turret = getTurretOffset(p0);
        drawLine(p.x - run * balls.R /2, p.y - rise * balls.R / 2,
                 p.x + turret[0], p.y + turret[1], 'white', context);
    });
}
            
// turn integer into a string at least 4 digits long
function padwithzeroes(i) {
    var str = i
    if (i < 1000) str = '0' + str;
    if (i < 100) str = '0' + str;
    if (i < 10) str = '0' + str;
    return str
}
            
// converts the xdir and ydir into velocities
function getVelocities(xdir, ydir) {
    var d = balls.velocitymap[xdir][ydir];
    return [ d[0] * balls.speed, d[1] * balls.speed ];
}

// move the player based on what keys are pressed
function movePlayer(player, canvas) {
    var xdir = 1; // domain is [0, 1, 2]
    if (balls.controls.left) xdir--; 
    if (balls.controls.right) xdir++;
    var ydir = 1; // domain is [0, 1, 2]
    if (balls.controls.up) ydir--;
    if (balls.controls.down) ydir++;
                
    var d = getVelocities(xdir, ydir);
    var vx = d[0];
    var vy = d[1];
    // there's actually 9 players; 1 in each block of 3X3 board
    player.forEach(function(p) {
        p.x += vx
        p.y += vy
    });
    // flip the players if necessary
    if (player[0].x - balls.R > canvas.width) {
        player.forEach(function(p) {
            p.x -= canvas.width
        });
    }
    if (player[0].x + balls.R < 0) {
        player.forEach(function(p) {
            p.x += canvas.width;
        });
    }
    if (player[0].y - balls.R > canvas.height) {
        player.forEach(function(p) {
            p.y -= canvas.height;
        });
    }
    if (player[0].y + balls.R < 0) {
        player.forEach(function(p) {
            p.y += canvas.height;
        });
    }
}

// return true if the given coordinate is on screen, false otherwise
function onScreen(x, y) {
    var w = $('#myCanvas').width();
    var h = $('#myCanvas').height();
    return x >= 0 &&
           x < w &&
           y >= 0 &&
           y < h;
}

// get the x and y coordinate of the tip of the turret where rise^2 + run^2 = 1
// i.e. the length of the turret is 1
function getNormalizedTurretOffset(p) {
    var m = ((balls.mouseY - p.y) / (balls.mouseX - p.x)); // slope
    var run = Math.sqrt(1 / (m * m + 1));
    var rise = m * run;
    if (p.x > balls.mouseX) {
        run = -run;
        rise = -rise;
    } else if (p.x == balls.mouseX) { // slope would be undefined
        var run = 0;
        var rise = 1;
    }
    return [run, rise]
}

// return the x and y coordinate of the tip of the turret offset
// for drawing and shooting
function getTurretOffset(p) {
    var turret = getNormalizedTurretOffset(p);
    turret[0] *= balls.turretLength;
    turret[1] *= balls.turretLength;
    return turret;
}

// add bullets 
function fire(player, bullets) {
    jBeep('laser.wav');
    var turret = getTurretOffset(player[0]); // if done for each then 
                                        // multiple shots can be made from walls
    player.forEach(function(p) {
        // if the turret tip is on screen then make a bullet
        if (onScreen(turret[0] + p.x, turret[1] + p.y)) {

            bullets.push({
                'x' : turret[0] + p.x,
                'y' : turret[1] + p.y,
                'vx' : turret[0] / balls.turretLength * balls.bullet_speed,
                'vy' : turret[1] / balls.turretLength * balls.bullet_speed
            });
        }
    });
}

// return euclidian distance
function distance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2)
                     +
                     Math.pow((y1 - y2), 2));
}

// checks to see if there was a collision between enemy and player
function collision(e, p) {
    return distance(e.x, p.x, e.y, p.y) < 2 * balls.R;
}
            
function animate(enemies, canvas, context, score, player, bullets) {
    setTimeout(function() {
        // update
        score.time += balls.fr; // framerate
        var time = score.time; // saves time writing score

        document.getElementById("score").innerHTML = padwithzeroes(time + score.shotBonus);

        // time between adds goes down by the addrate each time, starting at 5 seconds
        // but asymptoting at 1 second
        if (time - balls.lastAdd > 4000 * Math.pow(balls.addRate, balls.ballsAdded) + 1000) {
            // add a ball and reset time
            balls.lastAdd = time;
            balls.ballsAdded++;
            enemies.push(createBall(canvas));
        }

        // move the balls
        enemies.forEach(function(enemy) {
            moveBall(enemy, canvas);
        });

        if (balls.shoot) {
            fire(player, bullets);
            balls.shoot = false;
            balls.cocked = false; // can't hold it down forever
        }

        // move the bullets
        for (var i in bullets) {
            var b = bullets[i];
            moveBullet(b, canvas);
            // check to see if it hit an enemy
            var hit = false;
            for (var j in enemies) {
                var e = enemies[j];
                if (e.time < 1000) continue;
                // it can hit more than one enemy
                if (distance(b.x, e.x, b.y, e.y) < balls.R + balls.bullet_R) {
                    jBeep('boom.wav');
                    score.shotBonus += 1000;
                    hit = true;
                    enemies.splice(j--, 1); // decrement j since shifting left
                }
            }
            // remove it if it's offscreen or if it hit an enemy
            if (!(onScreen(b.x, b.y + balls.bullet_R) ||
                  onScreen(b.x + balls.bullet_R, b.y) ||
                  onScreen(b.x, b.y - balls.bullet_R) ||
                  onScreen(b.x - balls.bullet_R, b.y)) || hit)
                bullets.splice(i, 1); // decrement i since indices shift
        }

        // move the player
        movePlayer(player, canvas);
                
        // clear with dark background
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#222';
        context.fill();

        // draw stuff
        // while checking for collisions
        var alive = true
        enemies.forEach(function(enemy) {
            if (!enemy.hidden) {
                drawBall(enemy, context, 'orange');
            }
            if (enemy.time > 1000) {
                // check to see if it hit player
                player.forEach(function(p) {
                    if (collision(enemy, p)) {
                        alive = false;
                    }
                });
            }
        }); 
        bullets.forEach(function(bullet) {
            drawBullet(bullet, context, 'white');
        })
                
        player.forEach(function(p) {
            drawBall(p, context, 'cyan');   
        });
        // draw turret on top
        drawTurrets(player, context);
                
        if (balls.controls.paused) {
            startBGAnimation();
            // temporarily remove event listeners
            $('#myCanvas').trigger('holdfire');
            document.onkeydown = function(event) {
                if (!event) event = window.event // browser compatibility
                pressed(event) // unpauses in case of spacebar
                    // if spacebar
                    if (event.keyCode == 80) {
                        stopBGAnimation();
                        // restore event listeners
                        document.onkeydown = pressed;
                        canvas.addEventListener('click', function(e) {
                            e.preventDefault();
                            fire(player, bullets); // mousemove has saved aim
                            // remove itself on pause or death
                            var callee = arguments.callee;
                            var self = this;
                            $('#myCanvas').bind('holdfire', function(e) { 
                                self.removeEventListener('click', callee);
                            });
                        });
                        animate(enemies, canvas, context, score, player, bullets);
                    }
                };
        } else if (alive) {
            animate(enemies, canvas, context, score, player, bullets);
        } else {    
            jBeep('death.wav');
            reset(time + score.shotBonus);           
        }
    }, 1000 / 60);
}

// start a new game
function play() {
    var canvas = document.getElementById("myCanvas")
    var context = canvas.getContext('2d');
    // reset screen
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#222';
    context.fill();
    var score = {
        'time' : 0,
        'shotBonus' : 0
    }
    // make a new empty set of enemies...
    var enemies = [];
    // ...then fill it with ten random balls 
    var bullets = []; // start with no bullets
    for (var i = 0; i < 10; i++) {
        enemies.push(createBall(canvas));
    }

    // reset these for new game
    balls.lastAdd = 0;
    balls.ballsAdded = 0;

    // make player
    var w = canvas.width;
    var h = canvas.height;
    var centerx = w / 2;
    var centery = h / 2;
    var player = [
        { 'x' : centerx, 'y' : centery },
        // go counterclockwise around
        { 'x' : centerx + w, 'y' : centery },
        { 'x' : centerx + w, 'y' : centery + h },
        { 'x' : centerx, 'y' : centery + h },
        { 'x' : centerx - w, 'y' : centery + h },
        { 'x' : centerx-w, 'y' : centery },
        { 'x' : centerx - w, 'y' : centery - h },
        { 'x' : centerx, 'y' : centery - h },
        { 'x' : centerx + w, 'y' : centery - h }
    ];
    // set event listeners
    document.removeEventListener("click", play)
    document.onkeydown = pressed
    document.onkeyup =  released
    canvas.addEventListener('click', function(e) {
        e.preventDefault();
        fire(player, bullets); // mousemove has saved aim
        // remove itself on pause or death
        var callee = arguments.callee;
        var self = this;
        $('#myCanvas').bind('holdfire', function(e) { 
            self.removeEventListener('click', callee);
        });
    });

    stopBGAnimation();
    // begin!
    animate(enemies, canvas, context, score, player, bullets)
}

// event handler for key press          
function pressed(event) {
    if (!event) event = window.event // browser compatibility
    switch (event.keyCode) {
    case 37: // key code for left key
    case 65: // key code for 'a'
        balls.controls.left = true;
        break;
    case 38: // key code for up key
    case 87: // key code for 'w'
        balls.controls.up = true;
        break;
    case 39: // key code for right key 
    case 68: // key code for 'd'
        balls.controls.right = true;
        break;
    case 40: // key code for down key
    case 83: // key code for 's'
        balls.controls.down = true
        break;
    case 80: // key code for 'p'
        balls.controls.paused = !balls.controls.paused
        break;
    case 32: // key code for space bar
        if (!balls.controls.paused && !balls.bganim && balls.cocked) {
            balls.shoot = true;
        }
    }
}

// event handler for key press          
function released(event) {
    if (!event) event = window.event // browser compatibility
    switch (event.keyCode) {
        case 37: // key code for left key
        case 65: // key code for 'a'
            balls.controls.left = false
            break;
        case 38: // key code for up key
        case 87: // key code for 'w'
            balls.controls.up = false
            break;
        case 39: // key code for right key
        case 68: // key code for 'd'
            balls.controls.right = false
            break;
        case 40: // key code for down key
        case 83: // key code for 's'
            balls.controls.down = false
            break;
        case 32: // releasing space bar 'cocks' it
            balls.cocked = true;
    }
}
            
// when the player dies
function reset(score) {
    alert('You died!\nYour score was: ' + score);
    balls.controls.left = false;
    balls.controls.right = false;
    balls.controls.up = false;
    balls.controls.down = false;
    balls.controls.paused = false;

    // save score in a cookie if it's a new highscore for the user 
    var highscore = getSessionHighScore()
    if (score > highscore) {
        highscore = score
        saveSessionHighScore(highscore)
    }
    document.getElementById("highscore").innerHTML = highscore
    
    // check to the leaderboards and post
    checkAllTimeHighScores(score); 
    checkDailyHighScores(score);

    // reset the 'press any key to play' event
    document.onkeydown = play;
    // remove the click listener
    $('#myCanvas').trigger('holdfire');
    // run the background animation in the meantime
    startBGAnimation();
}
     
// instead of setTimeout
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           window.oRequestAnimationFrame || 
           window.msRequestAnimationFrame ||
           function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    })();

// an animation to run while the user isn't playing
function backgroundAnimation(enemies, canvas, context) {
    // move the balls
    enemies.forEach(function(enemy) {
        moveBall(enemy, canvas)
    });
    
    // clear with dark background
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#222';
    context.fill();
                
    // draw stuff
    enemies.forEach(function(enemy) {
        if (!enemy.hidden) { // it never actually is but in case i want to change ti
            drawBall(enemy, context, 'orange')
        }
    });

    if (balls.bganim) {
        // don't have to use set timeout since consistent frame rate isn't important
        requestAnimFrame(function() { 
            backgroundAnimation(enemies, canvas, context);
        });
    }
}
            
function stopBGAnimation () {
    balls.bganim = false;
}
function startBGAnimation() {
    balls.bganim = true;
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var ball = createBall(canvas); // one for fun
    ball.time = 1000; // start out not blinking
    var enemies = [ball];
            
    backgroundAnimation(enemies, canvas, context);
}
            
// check the db to see if score is an all-timehigh score
function checkAllTimeHighScores(score) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 
                 "/checkalltime?score=" + score,
                 false); // not asyncronous
    xmlhttp.send();
    if (parseInt(xmlhttp.responseText)) {
        var name = 
         prompt('Congratulations! That\'s a new All-Time high score!\nEnter your name');
        while (!name) {
            name = prompt('Please enter a name');
        }
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET",
                     "/sendalltime?name=" +
                     name.substring(0, 23) +
                      "&score=" + score, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                makeHighScoreTable('alltime',
                    document.getElementById('alltimeLB'));
            }
        };
        xmlhttp.send();
    }
}

// check the db to see if score is a daily score
function checkDailyHighScores(score) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 
                 "/checkdaily?score=" + score,
                 false); // not asyncronous
    xmlhttp.send();
    if (parseInt(xmlhttp.responseText)) {
        var name = 
         prompt('Congratulations! That\'s  a new daily high score!\nEnter your name');
        while (!name) {
            name = prompt('Please enter a name');
        }
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET",
                     "/senddaily?name=" +
                     name.substring(0, 23) +
                     "&score=" + score, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                makeHighScoreTable('daily', 
                document.getElementById('dailyLB'));
            }
        };
        xmlhttp.send();
    }
}

// make the table, which one depends on title 
function makeHighScoreTable(title, table) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/get" + title, true)
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            makeTable(JSON.parse(xmlhttp.responseText).scores, table);
        }
    }
    xmlhttp.send();
}
            
// compoare to json score objects by the value of score
function compareScores(a, b) {
    return b.score - a.score;
}

// make a highscore table on scoreboard (the table element) with highscores            
function makeTable(highscores, scoreboard) {
    highscores.sort(compareScores);
                
    // clear out the old highscores...
    for (var i = 2; i < scoreboard.rows.length; ) 
        scoreboard.deleteRow(i);
    
    // ...and put in the new ones            
    for (var i = 0; i < highscores.length; i++) {
        var row = scoreboard.insertRow(scoreboard.rows.length);
        row.insertCell(0).innerHTML = i+1; // No.
        row.insertCell(1).innerHTML = highscores[i].name;
        row.insertCell(2).innerHTML = highscores[i].score;
    }
}


// use a cookie to save high score
function saveSessionHighScore(highscore) {
    document.cookie="highscore=" + highscore
}

// get the cookie
function getSessionHighScore() {
    return parseInt(getCookie("highscore"));
}

// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : 0;
}