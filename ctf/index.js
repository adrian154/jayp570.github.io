let canvas = document.querySelector("canvas");

canvas.width = 1800;
canvas.height = 800;

let g = canvas.getContext("2d");


const defaultACC = 0.8
const defaultFRIC = -0.1 //-0.05

let ACCELERATION = defaultACC
let FRICTION = defaultFRIC
let MOMENTUMLOSS = -0.5

const BULLETDAMAGE = 32;
let ammoDrops = [];

let powerups = {
    "shotgun": new Powerup("shotgun")
}



function Bullet(playerX,playerY,mouseX,mouseY,color,id) {

    playerX+=16;
    playerY+=16;
    this.pos = {
        "x": playerX,
        "y": playerY
    }
    this.mousePos = {
        "x": mouseX,
        "y": mouseY
    }
    this.vel = {
        "x": null,
        "y": null
    }
    this.vel.x = this.mousePos.x-this.pos.x;
    this.vel.y = this.mousePos.y-this.pos.y;
    let dist = Math.sqrt(Math.pow(this.vel.x,2)+Math.pow(this.vel.y,2));
    this.vel.x = this.vel.x/dist;
    this.vel.y = this.vel.y/dist;
    this.vel.x*=20;
    this.vel.y*=20;
    this.visible = true;
    this.w = 8;
    this.h = 8;

    this.team = color;
    this.id = id;
    
    this.setVisible = function(bool) {
        this.visible = bool;
    }

    this.update = function() {
        if(this.visible) {
            this.pos.x+=this.vel.x; this.pos.y+=this.vel.y;

            if(this.pos.x+this.w > canvas.width) {this.visible = false}
            if(this.pos.y+this.h > canvas.height) {this.visible = false}
            if(this.pos.x < 0) {this.visible = false}
            if(this.pos.y < 0) {this.visible = false}

            g.fillStyle = "orange";
            g.beginPath();
            g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
            g.fill();
            g.globalAlpha = 0.7;
            g.fillStyle = this.team;
            g.beginPath();
            g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
            g.fill();
            g.globalAlpha = 1.0;
        }
    }

    this.checkCollision = function(object) {
        let bX = object.getPos().x;
        let bY = object.getPos().y;
        let bW = object.getW();
        let bH = object.getH();
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.getVisible = function() {
        return this.visible;
    }

    this.getPos = function() {
        return {"x": this.pos.x-this.w/2, "y": this.pos.y-this.h/2};
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getID = function() {
        return this.id;
    }

    this.getVel = function() {
        return this.vel;
    }

}

function Player(x, y, color) {

    this.w = 32;
    this.h = 32;
    this.spawnPos = {
        "x": x,
        "y": y
    }
    this.pos = {
        "x": this.spawnPos.x,
        "y": this.spawnPos.y
    }
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.leftIn = false;
    this.rightIn = false;
    this.upIn = false;
    this.downIn = false;

    this.team = color;
    this.fullHealth = 100;
    this.health = this.fullHealth;
    this.isCarrier = false;
    this.bullets = [];
    this.bulletsNum = 3;
    this.fullDashTimer = 32;
    this.dashTimer = 32;

    this.id = null;

    this.powerups = {};
    for(let k in powerups) {
        this.powerups.k = false;
    }

    this.setDirection = function(code,bool) {
        switch(code) {
            case 65: this.leftIn = bool; break;
            case 87: this.upIn = bool; break;
            case 68: this.rightIn = bool; break;
            case 83: this.downIn = bool; break;
            default: ;
        }
    }

    this.setIsCarrier = function(bool) {
        this.isCarrier = bool;
    }

    this.setVel = function(vel) {
        this.vel = vel;
    }

    this.checkCollision = function(object) {
        let bX = object.getPos().x;
        let bY = object.getPos().y;
        let bW = object.getW();
        let bH = object.getH();
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.takeDamage = function(num) {
        this.health-=num;
    }

    this.heal = function(num) {
        this.health+=num;
        if(this.health >= this.fullHealth) {
            this.health = this.fullHealth;
        }
    }

    this.shoot = function(mouseX,mouseY) {
        if(this.bulletsNum > 0) {
            let x = this.pos.x+this.w/2;
            let y = this.pos.y+this.h/2;
            this.bullets.push(new Bullet(x,y,mouseX,mouseY,this.team,this.id));
            if(this.powerups.shotgun) {
                let dist = Math.sqrt(Math.pow(x-mouseX,2)+Math.pow(y-mouseY,2));
                let trshld = 100;
                let offset = {
                    one: {
                        x: Math.random()*(trshld-(-trshld))+(-trshld),
                        y: Math.random()*(trshld-(-trshld))+(-trshld),
                    },
                    two: {
                        x: Math.random()*(trshld-(-trshld))+(-trshld),
                        y: Math.random()*(trshld-(-trshld))+(-trshld),
                    }
                }
                this.bullets.push(new Bullet(x, y, mouseX+offset.one.x, mouseY+offset.one.y, this.team, this.id));
                this.bullets.push(new Bullet(x, y, mouseX+offset.two.x, mouseY+offset.two.y, this.team, this.id));
            }
            this.bulletsNum--;
        }
    }

    this.dash = function() {
        if(this.dashTimer >= this.fullDashTimer && this.isCarrier === false) {
            if(this.leftIn) {this.vel.x-=10}
            if(this.rightIn) {this.vel.x+=10}
            if(this.upIn) {this.vel.y-=10}
            if(this.downIn) {this.vel.y+=10}
            this.dashTimer = 0;
        }
    }

    this.pickUpAmmo = function() {
        this.bulletsNum++;
        if(this.bulletsNum > 3) {
            this.bulletsNum = 3;
            return false;
        }
        return true;
    }

    this.pickUpPowerup = function(powerupName) {
        for(let i in this.powerups) {
            this.powerups[i] = false;
        }
        this.powerups[powerupName] = true;
    }

    this.hasPowerup = function() {
        for(let k in this.powerups) {
            if(this.powerups[k]) {
                return true;
            }
        }
        return false;
    }

    this.respawn = function() {
        ammoDrops.push(new AmmoDrop(this.pos.x, this.pos.y));
        this.pos.x = this.spawnPos.x; 
        this.pos.y = this.spawnPos.y;
        this.health = this.fullHealth;
        this.bulletsNum = 3;
        this.dashTimer = this.fullDashTimer;
        for(let k in this.powerups) {
            this.powerups[k] = false;
        }
    }

    this.update = function(g) {
        ACCELERATION = defaultACC;
        if(this.isCarrier) {
            ACCELERATION = ACCELERATION/2;
        }
        this.acc.x = 0; this.acc.y = 0;
        this.w = 32; this.h = 32;
        if(this.leftIn) {
            this.acc.x = -ACCELERATION;
        }
        if(this.rightIn) {
            this.acc.x = ACCELERATION;
        }
        if(this.upIn) {
            this.acc.y = -ACCELERATION;
        }
        if(this.downIn) {
            this.acc.y = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        if(this.pos.x+this.w > canvas.width) {
            this.pos.x = canvas.width-this.w;
            this.vel.x*=MOMENTUMLOSS;
        }
        if(this.pos.y+this.h > canvas.height) {
            this.pos.y = canvas.height-this.h;
            this.vel.y*=MOMENTUMLOSS;
        }
        if(this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x*=MOMENTUMLOSS;
        }
        if(this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y*=MOMENTUMLOSS;
        }

        for(let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update();
        }
        for(let i = 0; i < this.bullets.length; i++) {
            if(this.bullets[i].getVisible() === false) {
                this.bullets.splice(i,1);
            }
        }

        if(this.health <= 0) {
            this.respawn();
        }

        if(this.dashTimer < this.fullDashTimer) {
            this.dashTimer+=0.5;
        }

        if(this.hasPowerup()) {
            g.shadowBlur = 10;
            g.shadowOffsetX = 0;
            g.shadowOffsetY = 0;
            g.shadowColor = "white";
        }
        g.fillStyle = this.team;
        g.fillRect(this.pos.x,this.pos.y,this.w,this.h);
        g.shadowBlur = 0;
        g.fillStyle = "red";
        g.fillRect(this.pos.x,this.pos.y-15,this.fullHealth/3,10);
        g.fillStyle = "green";
        g.fillRect(this.pos.x,this.pos.y-15,this.health/3,10);
        g.fillStyle = "orange";
        let x = 0
        for(let i = 1; i <= this.bulletsNum; i++) {
            g.beginPath();
            g.arc(this.pos.x+x,this.pos.y+10+this.h,5,0,2*Math.PI,false);
            g.fill();
            x = i*15;
        }
        g.fillStyle = "#62e3fc";
        g.fillRect(this.pos.x-15,this.pos.y+(this.w-this.dashTimer),10,this.dashTimer);
        g.beginPath();
    }

    this.getVel = function() {
        return this.vel;
    }

    this.getPos = function() {
        return this.pos;
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getHealth = function() {
        return this.health;
    }

    this.getIsCarrier = function() {
        return this.isCarrier;
    }

    this.getID = function() {
        return null;
    }

    this.getBullets = function() {
        return this.bullets;
    }

    this.getDirections = function() {
        let directions = {
            "leftIn": this.leftIn,
            "rightIn": this.rightIn,
            "upIn": this.upIn,
            "downIn": this.downIn
        }
        return directions;
    }

}

function Flag(base) {

    let basePos = base.getPos();
    this.spawnPos = {
        "x": basePos.x+base.getW()/2,
        "y": basePos.y+base.getH()/2
    }
    this.pos = {
        "x": this.spawnPos.x,
        "y": this.spawnPos.y
    }
    this.w = 25;
    this.h = 25;
    this.team = base.getTeam();
    this.carrier = null;
    this.fullTimer = 225;
    this.timer = this.fullTimer;
    this.depleting = false;

    this.update = function() {
        if(this.carrier != null) {
            this.pos.x = this.carrier.pos.x-5;
            this.pos.y = this.carrier.pos.y-5;
            if(this.carrier.getHealth() <= 0) {
                this.depleting = true;
                this.carrier.setIsCarrier(false);
                this.carrier = null;
            }
        }

        if(this.depleting) {
            this.timer--;
        }
        if(this.timer == 0) {
            this.respawn();
        }

        g.globalAlpha = this.timer/this.fullTimer;
        g.fillStyle = "white";
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2+3,0,2*Math.PI,false);
        g.fill();
        g.fillStyle = this.team;
        g.globalAlpha = 1.0
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        g.shadowBlur = 0;
    }

    this.setCarrier = function(player) {
        this.carrier = player;
        this.carrier.setIsCarrier(true);
        this.depleting = false;
        this.timer = this.fullTimer;
    }

    this.respawn = function() {
        if(this.carrier != null) {
            this.carrier.setIsCarrier(false);
            this.carrier = null;
        }
        this.pos.x = this.spawnPos.x;
        this.pos.y = this.spawnPos.y;
        this.depleting = false;
        this.timer = this.fullTimer;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getPos = function() {
        return {"x": this.pos.x-this.w/2, "y": this.pos.y-this.h/2};
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getCarrier = function() {
        return this.carrier;
    }

}

function Base(x,y,w,h,color) {

    this.pos = {
        "x": x,
        "y": y
    }
    this.w = w;
    this.h = h;
    this.team = color;

    this.update = function(g) {
        g.fillStyle = this.team;
        g.globalAlpha = 0.5;
        g.fillRect(this.pos.x,this.pos.y,this.w,this.h);
        g.globalAlpha = 1.0;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getPos = function() {
        return this.pos;
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }
}

function HealingStation(x, y, color) {

    this.pos = {
        "x": x,
        "y": y
    }
    this.team = color;
    this.w = 40;
    this.h = 40;

    this.update = function(g) {
        g.fillStyle = this.team;
        g.fillRect(this.pos.x-this.w/4, this.pos.y-this.w/2, this.w/2, this.w);
        g.fillRect(this.pos.x-this.w/2, this.pos.y-this.w/4, this.w, this.w/2);
        g.globalAlpha = 0.5;
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        g.globalAlpha = 1.0;
    }

    this.getPos = function() {
        return this.pos;
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getTeam = function() {
        return this.team;
    }

    this.getID = function() {
        return null;
    }

}

function AmmoDrop(x, y) {

    this.pos = {
        "x": x,
        "y": y
    }
    this.w = 10;
    this.h = 10;

    this.timer = 100;

    this.update = function() {
        g.fillStyle = "orange";
        g.globalAlpha = this.timer/100;
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.w/2,0,2*Math.PI,false);
        g.fill();
        this.timer--;
        g.globalAlpha = 1.0;
    }

    this.getPos = function() {
        return this.pos;
    }

    this.getW = function() {
        return this.w;
    }

    this.getH = function() {
        return this.h;
    }

    this.getTimer = function() {
        return this.timer;
    }

}



let activePowerup = powerups.shotgun;

let bases = {
    "red": new Base(0, canvas.height/2-75, 150, 150, "red"),
    "blue": new Base(canvas.width-150, canvas.height/2-75, 150, 150, "blue")
}

let flags = {
    "red": new Flag(bases.red),
    "blue": new Flag(bases.blue)
}

let healingStations = {
    "red": new HealingStation(50,50,"red"),
    "blue": new HealingStation(canvas.width-50, canvas.height-50, "blue")
}

let score = {
    "red": 0,
    "blue": 0
}

let players = {
    "player": [/*new Player("red")*/],
    "red": [],
    "blue": []
}
let count = 0
let redXPos = [0, 40, 80];
let redYPos = 767;
for(let i = 0; i < 3; i++) {
    if(i != 0) {
        players.red.push(new Bot(redXPos[i%3], 767, "red", flags, bases, healingStations, count))
    } else {
        players.player.push(new Player(redXPos[i%3], 767, "red"));
    }
    count++;
}
let blueXPos = [1767, 1727, 1727-40];
let blueYPos = [0, 0, 0];
for(let i = 1; i < 4; i++) {
    players.blue.push(new Bot(blueXPos[i%3], 0, "blue", flags, bases, healingStations, count))
    count++;
}
console.log(players.red)
console.log(players.blue)
for(let i = 0; i < players.red.length; i++) {
    players.red[i].setPlayers(players);
}
for(let i = 0; i < players.blue.length; i++) {
    players.blue[i].setPlayers(players);
}
//console.log(players.blue[0].getPlayers());

let showControls = false;

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener("mousedown", mouseDownHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    players.player[0].setDirection(code,true);
    if(code === 16) {
        players.player[0].takeDamage(1000);
    }
    if(code === 32) {
        players.player[0].dash();
    }
    if(code === 70) {
        showControls = true;
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    players.player[0].setDirection(code,false);
    if(code === 70) {
        showControls = false;
    }
}
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    players.player[0].shoot(mouseX,mouseY);
}



function animate() {

    requestAnimationFrame(animate);

    g.clearRect(0,0,canvas.width,canvas.height);

    g.fillStyle = "yellow";
    g.fillRect((canvas.width/2)-5,0,5,canvas.height);

    g.fillStyle = "red";
    g.textAlign = "center";
    g.font = "50px Tahoma";
    g.fillText(score.red,canvas.width/2-60,canvas.height/2-25);
    g.fillStyle = "blue";
    g.fillText(score.blue,canvas.width/2+55,canvas.height/2-25);

    FRICTION = defaultFRIC
    ACCELERATION = defaultACC

    healingStations.red.update(g);
    healingStations.blue.update(g);

    bases.red.update(g);
    bases.blue.update(g);
    for(let i = 0; i < ammoDrops.length; i++) {
        ammoDrops[i].update();
    }

    if(activePowerup != null) {
        activePowerup.update(g);
    }

    flags.red.update(g);
    flags.blue.update(g);

    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            players[i][j].update(g);
        }
    }

    if(showControls) {
        g.globalAlpha = 0.5;
        g.fillStyle = "black";
        g.fillRect(50,50,canvas.width-100,canvas.height-100);
        g.globalAlpha = 1.0;
        g.fillStyle = "white";
        g.textAlign = "center";
        g.font = "30px Tahoma";
        let verticalOffset = 160;
        g.fillText("W - UP", canvas.width/2, verticalOffset+100);
        g.fillText("A - LEFT", canvas.width/2, verticalOffset+140);
        g.fillText("S - DOWN", canvas.width/2, verticalOffset+180);
        g.fillText("D - RIGHT", canvas.width/2, verticalOffset+220);
        g.fillText("LEFT CLICK - SHOOTS TOWARDS CURSOR", canvas.width/2, verticalOffset+260);
        g.fillText("SPACE - DASH", canvas.width/2, verticalOffset+300);
        g.fillText("F - CONTROLS", canvas.width/2, verticalOffset+340);
    }


    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            for(let base in bases) {
                if(player.getTeam() === bases[base].getTeam()) {
                    if(player.checkCollision(bases[base])) {
                        player.takeDamage(1);
                        if(player.getIsCarrier() == true) {
                            let playersTeam = player.getTeam();
                            let enemyTeam;
                            for(let k in flags) {
                                if(k != playersTeam) {
                                    enemyTeam = k;
                                }
                            }
                            score[playersTeam]+=1;
                            flags[enemyTeam].respawn();

                        }
                        break;
                    }
                }
            }
        }
    }

    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            for(let flag in flags) {
                if(player.checkCollision(flags[flag]) && player.getHealth() > 0 &&
                flags[flag].getCarrier() === null) {
                    if(player.getTeam() != flags[flag].getTeam()) {
                        flags[flag].setCarrier(player);
                        break;
                   }
                }
            }
        }
    }

    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            for(let i in healingStations) {
                if(player.getTeam() === healingStations[i].getTeam()) {
                    if(player.checkCollision(healingStations[i])) {
                        player.heal(2);
                    }
                }
            }
        }
    }

    bullets = [];
    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            bullets.push(player.getBullets())
        }
    }
    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            for(let k = 0; k < bullets.length; k++) {
                for(let l = 0; l < bullets[k].length; l++) {
                    let bullet = bullets[k][l];
                    if(player.checkCollision(bullet) && player.getID() != bullet.getID()) {
                        player.takeDamage(BULLETDAMAGE);
                        player.vel.x+=bullet.getVel().x/2;
                        player.vel.y+=bullet.getVel().y/2;
                        bullet.setVisible(false);
                    }
                }
            }
        }
    }

    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player = players[i][j];
            for(let k = 0; k < ammoDrops.length; k++) {
                let ammoDrop = ammoDrops[k];
                if(player.checkCollision(ammoDrop)) {
                    if(player.pickUpAmmo()) {
                        ammoDrops.splice(k,1);
                    }
                }
            }
        }
    }

    if(activePowerup != null) {
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                if(player.checkCollision(activePowerup)) {
                    player.pickUpPowerup(activePowerup.name);
                    activePowerup = null;
                    break;
                }
            }
        }
    }

    for(let i = 0; i < ammoDrops.length; i++) {
        if(ammoDrops[i].getTimer() < 0) {
            ammoDrops.splice(i,1);
        }
    }

    for(let i in players) {
        for(let j = 0; j < players[i].length; j++) {
            let player1 = players[i][j];
            for(let k in players) {
                for(let l = 0; l < players[k].length; l++) {
                    let player2 = players[k][l];
                    if(player1.checkCollision(player2) && player1.getID() != player2.getID()) {
                        if(player1.getTeam() != player2.getTeam()) {
                            player2.vel.x = player1.vel.x*-1.01;
                            player2.vel.y = player1.vel.y*-1.01;
                            player1.vel.x*=-1.01;
                            player1.vel.y*=-1.01;
                            player2.takeDamage(Math.random()*5+1);
                        }
                    }
                }
            }
        }
    }
}


animate();


/*
TO DO
fix player and bot spawn locations

add bots
add player deaths drop ammo
add flag drops when player dies
*/