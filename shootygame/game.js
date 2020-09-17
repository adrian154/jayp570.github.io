let canvas = document.querySelector("canvas");

canvas.width = 1280;
canvas.height = 720;

let g = canvas.getContext("2d");

const TILESIZE = 125;

const ACCELERATION = 0.75
const FRICTION = -0.1 //-0.05

const GUNNAMES = ["shotgun", "rocketlauncher"]

let rawMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function getDist(a, b) {
    let distX = b.pos.x - a.pos.x
    let distY = b.pos.y - a.pos.y
    let dist = Math.sqrt(Math.pow(distX, 2)+Math.pow(distY, 2))
    return dist
}

function getDistPos(posA, posB) {
    let distX = posB.x - posA.x
    let distY = posB.y - posA.y
    let dist = Math.sqrt(Math.pow(distX, 2)+Math.pow(distY, 2))
    return dist
}

function getMagnitude(vector) {
    let x = vector.x;
    let y = vector.y;
    let mag = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2))
    return mag
}

function getExplosionParticles() {
    return {
        speed: [1, 10], 
        size: [1, 70],
        shapes: ["circle"],
        effectWidth: 360,
        destroyTime: [5, 5],
        fadeOut: 0,
        shrink: 6,
        angle: 90,
        colors: ["yellow", "darkorange", "orange", "gray", "darkgray", "red"],
        particleAmount: 100,
        continuous: false,
        effectVel: {x: 0, y: 0}
    }
}

function Tile(x, y, state) {

    this.state = state

    this.pos = {
        x: x,
        y: y
    }

    this.w = TILESIZE
    this.h = TILESIZE

    this.hitColor = "#ccc"

    this.draw = function() {
        if(this.state == 0) {
            g.fillStyle = "#3a3a3a"
        } else {
            g.fillStyle = "#ccc"
        }
        g.fillRect(this.pos.x, this.pos.y, this.w+1, this.h+1)
    }
}

function Map(x, y, map) {

    this.pos = {
        x: x,
        y: y
    }

    this.map = []
    for(let i = 0; i < map.length; i++) {
        this.map.push([])
        for(let j = 0; j < map[i].length; j++) {
            this.map[i].push(new Tile(this.pos.x+(j*TILESIZE), this.pos.y+(i*TILESIZE), map[i][j]))
        }
    }

    this.h = this.map.length*TILESIZE
    this.w = this.map[0].length*TILESIZE

    this.draw = function() {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].draw()
            }
        }
    }

    this.update = function(offsetX, offsetY) {
        for(let i = 0; i < this.map.length; i++) {
            for(let j = 0; j < this.map[i].length; j++) {
                this.map[i][j].pos.x -= offsetX
                this.map[i][j].pos.y -= offsetY
            }
        }
        this.pos.x -= offsetX; this.pos.y -= offsetY;
    }
}

function Player(x, y, team) {

    this.id = 0;

    this.pos = {
        x: x,
        y: y
    }
    this.size = 20
    this.vel = {
        "x": 0,
        "y": 0
    }
    this.acc = {
        "x": 0,
        "y": 0
    }
    this.input = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    this.team = team

    this.maxHealth = 100
    this.health = this.maxHealth

    this.maxDashMeter = 100
    this.dashMeter = this.maxDashMeter

    this.playerAngle = 0
    this.aimAngle = 0

    this.gunInventory = []

    this.grenadeCount = 5

    this.bullets = []
    this.grenades = []

    this.heldSlot = 0
    this.heldGun = this.gunInventory[this.heldSlot]

    this.posOnMap = {
        x: this.pos.x-map.pos.x,
        y: this.pos.y-map.pos.y
    }

    this.hitColor = "red"


    this.setDirection = function(code,bool) {

        switch(code) {
            case 65: this.input.left = bool; break;
            case 87: this.input.up = bool; break;
            case 68: this.input.right = bool; break;
            case 83: this.input.down = bool; break;
            default: ;
        }
        
    }

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h;
        let x = this.pos.x-this.size/2;
        let y = this.pos.y-this.size/2;
        let w = this.size;
        let h = this.size;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.shoot = function() {

        if(this.heldGun.clip > 0 && this.heldGun.reloading == false && this.heldGun.canFire) {

            let firePoint = {
                x: this.pos.x+(Math.cos(this.aimAngle*(Math.PI/180))*60),
                y: this.pos.y+(Math.sin(this.aimAngle*(Math.PI/180))*60)
            }
            if(this.heldGun.name == "pistol") {
                this.bullets.push(new Projectile(
                    "assets/projectiles/bullet.png", 
                    firePoint.x, firePoint.y,
                    this.id, 
                    this.aimAngle, 
                    30, 
                    20
                ))
            } else if(this.heldGun.name == "shotgun") {
                let spread = [0, Math.random()*10+10, Math.random()*(-10)+10]
                for(let i = 0; i < 3; i++) {
                    this.bullets.push(new Projectile(
                        "assets/projectiles/bullet.png", 
                        firePoint.x, firePoint.y,
                        this.id, 
                        this.aimAngle+spread[i], 
                        30, 
                        20
                    ))
                    if(i == 0) {
                        this.vel.x -= this.bullets[this.bullets.length-1].vel.x/2
                        this.vel.y -= this.bullets[this.bullets.length-1].vel.y/2
                    }
                }
            } else if(this.heldGun.name == "rocketlauncher") {
                this.bullets.push(new Projectile(
                    "assets/projectiles/rocket.png", 
                    firePoint.x, firePoint.y,
                    this.id, 
                    this.aimAngle, 
                    12, 
                    25
                ))
                this.vel.x -= this.bullets[this.bullets.length-1].vel.x/3
                this.vel.y -= this.bullets[this.bullets.length-1].vel.y/3
            }

            this.heldGun.lastShot = this.heldGun.frame

            this.heldGun.clip--

        }

        if(this.heldGun.clip == 0 && this.heldGun.reloading == false) {
            this.heldGun.reloadStartFrame = this.heldGun.frame
        }
    }

    this.throwGrenade = function() {
        if(this.grenadeCount > 0) {
            this.grenades.push(new Grenade(
                "assets/projectiles/grenade.png", 
                this.pos.x, 
                this.pos.y,
                this.id,
                this.aimAngle,
                20,
                0
            ))
            this.grenadeCount--
        }
    }

    this.dash = function() {
        if(this.dashMeter >= 50) {
            if(this.input.left) {
                this.vel.x = -30
            }
            if(this.input.up) {
                this.vel.y = -30
            }
            if(this.input.right) {
                this.vel.x = 30
            }
            if(this.input.down) {
                this.vel.y = 30
            }
            this.dashMeter-=50
            if(this.dashMeter < 0) {
                this.dashMeter = 0
            }
            this.playerAngle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false, 
                colors: ["#fff"],
                angle: this.playerAngle,
                particleAmount: 20,
                destroyTime: [0, 5],
                fadeOut: 0.01,
                effectWidth: 50,
                shrink: 1,
                size: [7, 15],
                shapes: ["circle"],
            }, g))
        }
    }

    this.update = function() {
        
        this.heldGun = this.gunInventory[this.heldSlot]

        this.acc.x = 0; this.acc.y = 0;
        if(this.input.left) {
            this.acc.x = -ACCELERATION;
        }
        if(this.input.right) {
            this.acc.x = ACCELERATION;
        }
        if(this.input.up) {
            this.acc.y = -ACCELERATION;
        }
        if(this.input.down) {
            this.acc.y = ACCELERATION;
        }
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        //this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.posOnMap = {
            x: this.pos.x-map.pos.x,
            y: this.pos.y-map.pos.y
        }

        //this.playerAngle = Math.atan2(this.vel.y, this.vel.x) * (180/Math.PI)

        if(this.health < 0) {
            this.health = 0
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false,
                particleAmount: 100,
                effectWidth: 360,
                colors: [this.hitColor],
                destroyTime: [0, 0],
                speed: [15, 20],
                size: [15, 25]
            }, g))
            playerRespawn(this.posOnMap.x, this.posOnMap.y, 300, 100)
            this.health = this.maxHealth
            this.dashMeter = this.maxDashMeter
        }

        this.dashMeter += 1
        if(this.dashMeter > this.maxDashMeter) {
            this.dashMeter = this.maxDashMeter
        }

        this.heldGun.frame++
    }

    this.updateItems = function() {
        for(let item of this.gunInventory) {
            item.update(0, 0)
            this.gunInventory[this.heldSlot].angle = this.aimAngle
        }

        for(let bullet of this.bullets) {
            bullet.update(this.vel.x, this.vel.y)
        }

        for(let grenade of this.grenades) {
            grenade.update(this.vel.x, this.vel.y)
        }
    }

    this.draw = function() {
        for(let bullet of this.bullets) {
            bullet.draw()
        }
        for(let grenade of this.grenades) {
            grenade.draw()
        }
        g.fillStyle = this.team
        g.beginPath();
        g.arc(this.pos.x,this.pos.y,this.size,0,2*Math.PI,false);
        g.fill();
        this.gunInventory[this.heldSlot].draw()
    }

    this.drawHud = function() {
        g.fillStyle = "red"
        g.fillRect(10, canvas.height-90, this.maxHealth*4, 35)
        g.fillStyle = "green"
        g.fillRect(10, canvas.height-90, this.health*4, 35)
        g.fillStyle = "white"
        g.fillRect(10, canvas.height-50, this.maxDashMeter*3, 25)
        g.fillStyle = "cyan"
        g.fillRect(10, canvas.height-50, this.dashMeter*3, 25)
        g.fillStyle = "white"
        g.font = "bold 40px consolas"
        g.fillText(this.heldGun.clip+"/"+this.heldGun.maxClip, canvas.width-150, canvas.height-40) 
        if(this.heldGun.reloading) {
            let reloadBarLength = this.heldGun.frame-this.heldGun.reloadStartFrame 
            g.fillStyle = "white"
            g.fillRect((canvas.width/2)-this.heldGun.reloadSpeed/2, 10, this.heldGun.reloadSpeed, 15)  
            g.fillStyle = "gold"
            g.fillRect((canvas.width/2)-reloadBarLength/2, 10, reloadBarLength, 15)  
        }
    }
}


function Crate(x, y) {

    this.pos = {
        x: x,
        y: y
    }
    this.vel = {
        x: 0,
        y: 0
    }
    this.acc = {
        x: 0,
        y: 0
    }

    this.w = 60
    this.h = 60

    this.health = 100;

    this.hitColor = "moccasin"

    this.checkCollision = function(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.w;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }

    this.draw = function() {
        g.fillStyle = "moccasin"
        if(this.health > 0) {
            g.fillRect(this.pos.x, this.pos.y, this.w, this.h)
        }
    }

    this.update = function(offsetX, offsetY) {
        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION;    this.acc.y += this.vel.y * FRICTION;
        this.vel.x += this.acc.x;               this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.pos.x -= offsetX; this.pos.y -= offsetY;

        if(this.health <= 0) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                continuous: false,
                particleAmount: 100,
                effectWidth: 360,
                colors: ["moccasin"],
                destroyTime: [0, 0],
                speed: [15, 20],
                size: [15, 25]
            }, g))
            items.push(new Gun(this.pos.x, this.pos.y, GUNNAMES[Math.floor(Math.random()*GUNNAMES.length)]))
        }
    }

}



let map = new Map(0, 0, rawMap)

let particleEffects = []

let players = [
    new Player(canvas.width/2, canvas.height/2, "red"),
    new Bot(1000, 100, "blue", 1),
    new Bot(1000, 300, "yellow", 2),
    new Bot(700, 100, "orange", 3),
    // new Bot(900, 300, "purple", 4),
    // new Bot(800, 100, "green", 5),
    // new Bot(1000, 400, "white", 6),
]

let items = []

for(let player of players) {
    items.push(new Gun(0, 0, "pistol"))
}
for(let i = 0; i < players.length; i++) {
    players[i].gunInventory.push(items[i])
    items[i].carrier = players[i]
}

let crates = [
    new Crate(100, 100), new Crate(200, 100)
]


window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
window.addEventListener('mousemove', mouseMoveHandler, false);
window.addEventListener('mousedown', mouseDownHandler, false);
window.addEventListener('wheel', scrollHandler, false);

function keyDownHandler(e) {

    let player = players[0]

    let code = e.keyCode;
    player.setDirection(code,true);

    //dash
    if(code == 32) {
        players[0].dash()
    }

    //pick up weapon
    if(code == 69 && player.gunInventory.length < 2) {
        for(let item of items) {
            if(item.carrier == null) {
                if(getDist(player, item) < 110) {
                    item.carrier = player
                    player.gunInventory.push(item)
                    for(let i = 0; i < player.gunInventory.length; i++) {
                        if(player.gunInventory[i].name == "pistol") {
                            player.gunInventory.splice(i, 1)
                        }
                    }
                    break;
                }
            }
        }
    }

    //reload weopon
    if(code == 82 && player.heldGun.reloading == false && player.heldGun.clip < player.heldGun.maxClip) {
        player.heldGun.reloadStartFrame = player.heldGun.frame
    }

    //switch weapon
    if(players[0].gunInventory.length > 1) {
        if(code == 49) {
            players[0].heldSlot = 0
        }
        if(code == 50) {
            players[0].heldSlot = 1
        }
    }

    //throw grenade
    if(code == 71) {
        player.throwGrenade()
    }
}

function keyUpHandler(e) {
    let code = e.keyCode;
    players[0].setDirection(code,false);
}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let playerX = players[0].pos.x; let playerY = players[0].pos.y;
    let x = playerX-mouseX; let y = playerY-mouseY;
    players[0].aimAngle = Math.atan2(-y, -x)*(180/Math.PI)
}

function mouseDownHandler(e) {
    players[0].shoot()
}

function scrollHandler(e) {
    if(players[0].gunInventory.length > 1) {
        let playerLookAngle = players[0].gunInventory[players[0].heldSlot].angle
        if(players[0].heldSlot == 0) {
            players[0].heldSlot = 1
            players[0].gunInventory[players[0].heldSlot].angle = playerLookAngle
        } else if(players[0].heldSlot == 1) {
            players[0].heldSlot = 0
            players[0].gunInventory[players[0].heldSlot].angle = playerLookAngle
        }
    }
}

let frame = 0


function playerRespawn(playerX, playerY, respawnX, respawnY) {
    
    let x = playerX-respawnX
    let y = playerY-respawnY



    map.pos.x += x; map.pos.y += y;
    for(let i = 0; i < map.map.length; i++) {
        for(let j = 0; j < map.map[i].length; j++) {
            map.map[i][j].pos.x += x; map.map[i][j].pos.y += y;
        }
    }

    for(let crate of crates) {
        crate.pos.x += x; crate.pos.y += y;
    }

    for(let player of players) {
        if(player.id != 0) {
            player.pos.x += x; player.pos.y += y
        }
    }

    for(let item of items) {
        if(item.carrier == null) {
            item.pos.x += x; item.pos.y += y;
        }
    }

    for(let effect of particleEffects) {
        effect.pos.x += x; effect.pos.y += y;
        for(let particle of effect.particles) {
            particle.pos.x += x; particle.pos.y += y;
        }
    }

}



function animate() {
    requestAnimationFrame(animate);
	
    //updates map
    map.update(players[0].vel.x, players[0].vel.y)

    //checks crate collision with walls
    for(let crate of crates) {
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(crate.checkCollision(map.map[i][j])) {
                        crate.vel.x*=-1; crate.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }
    }

    //updates crates and deletes destroyed crates
    let count = 0
    for(let crate of crates) {
        crate.update(players[0].vel.x, players[0].vel.y)
        if(crate.health <= 0) {
            crates.splice(count, 1)        
        }
        count++
    }

    //updates items
    for(let item of items) {
        if(item.carrier == null) {
            item.update(players[0].vel.x, players[0].vel.y)
        }
    }


    //spawns crates periodically
    if(frame%1 == 0) {
        if(crates.length < 6) {
            let crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
            let crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
            let crateSpawn = new Crate(crateSpawnX, crateSpawnY)
            let inWall = false
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(crateSpawn.checkCollision(map.map[i][j])) {
                            inWall = true
                        }
                    }
                }
            }
            while(inWall == true) {
                crateSpawnX = getRandomNum(map.pos.x, map.pos.x+map.w-100)
                crateSpawnY = getRandomNum(map.pos.y, map.pos.y+map.h-100)
                crateSpawn = new Crate(crateSpawnX, crateSpawnY)
                inWall = false
                for(let i = 0; i < map.map.length; i++) {
                    for(let j = 0; j < map.map[i].length; j++) {
                        if(map.map[i][j].state == 1) {
                            if(crateSpawn.checkCollision(map.map[i][j])) {
                                inWall = true
                            }
                        }
                    }
                }
            }
            crates.push(crateSpawn)
        }
    }

    //updates items of player (grenades, bullets, guns)
    for(let player of players) {
        player.updateItems()
    }

    //updates player and bots
    for(let player of players) {
        if(player.id != 0) {
            player.update(players[0].vel.x, players[0].vel.y)
        }
    }
    players[0].update()

    //explodes grenades
    for(let player of players) {
        for(let num = 0; num < player.grenades.length; num++) {
            let grenade = player.grenades[num]
            if(grenade.timer > 200) {
                particleEffects.push(new ParticleEffect(grenade.pos.x, grenade.pos.y, getExplosionParticles(), g))
                player.grenades.splice(num, 1)
                explode(grenade, 30)
            }
        }
    }

    //updates particle effects
    for(let effect of particleEffects) {
        effect.pos.x -= players[0].vel.x
        effect.pos.y -= players[0].vel.y
        for(let particle of effect.particles) {
            particle.pos.x -= players[0].vel.x
            particle.pos.y -= players[0].vel.y
        }
    }


    for(let player of players) {
        //checks player collision with walls
        outerWallLoop:
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                if(map.map[i][j].state == 1) {
                    if(player.checkCollision(map.map[i][j])) {
                        player.vel.x*=-1; player.vel.y*=-1;
                        break outerWallLoop;
                    }
                }
                
            }
        }

        //checks player collision with crates
        for(let crate of crates) {
            if(player.checkCollision(crate)) {
                crate.vel.x += player.vel.x*1.5; crate.vel.y += player.vel.y*1.5;
                if(player.vel.x + player.vel.y >= 20) {
                    crate.health-=50
                }
            }
        }

        //checks if player is off the map
        if(player.checkCollision(map) == false) {
            player.health--;
        }

        //checks bullet collision
        for(let num = 0; num < player.bullets.length; num++) {
            
            let bullet = player.bullets[num]

            //checks bullet collision with wall
            outerWallLoop:
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(bullet.checkCollision(map.map[i][j])) {
                            if(bullet.name == "rocket") {
                                particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, getExplosionParticles(), g))
                                explode(bullet, 60)
                            }
                            player.bullets.splice(num, 1)
                            break outerWallLoop;
                        }
                    }
                }
            }

            //checks bullet collision with crates
            for(let crate of crates) {
                if(bullet.checkCollision(crate)) {
                    crate.health -= bullet.damage
                    crate.vel.x += bullet.vel.x/4; crate.vel.y += bullet.vel.y/4
                    if(bullet.name == "rocket") {
                        particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, getExplosionParticles(), g))
                        explode(bullet, 60)
                    }
                    player.bullets.splice(num, 1)
                }
            }

            //checks collision with other players
            for(let hitPlayer of players) {
                if(hitPlayer.id != player.id) {
                    if(bullet.checkCollisionPlayer(hitPlayer)) {
                        hitPlayer.health -= bullet.damage
                        hitPlayer.vel.x += bullet.vel.x/7; hitPlayer.vel.y += bullet.vel.y/7
                        if(bullet.name == "rocket") {
                            particleEffects.push(new ParticleEffect(bullet.pos.x, bullet.pos.y, getExplosionParticles(), g))
                            explode(bullet, 60)
                        }
                        player.bullets.splice(num, 1)
                    }
                }
            }
        }

        //checks grenade collision
        for(let num = 0; num < player.grenades.length; num++) {
            
            let grenade = player.grenades[num]
            
            //checks grenade collision with walls
            outerWallLoop:
            for(let i = 0; i < map.map.length; i++) {
                for(let j = 0; j < map.map[i].length; j++) {
                    if(map.map[i][j].state == 1) {
                        if(grenade.checkCollision(map.map[i][j])) {
                            grenade.vel.x *= -1; grenade.vel.y *= -1;
                            break outerWallLoop;
                        }
                    }
                }
            }

            for(let crate of crates) {
                if(grenade.checkCollision(crate)) {
                    crate.health -= 5
                    grenade.vel.x *= -1; grenade.vel.y *= -1;
                }
            }
        }
    }



    //draws everything
    if(frame%1 == 0) {

        g.clearRect(0,0,canvas.width,canvas.height);
        g.fillStyle = "orangered"
        g.fillRect(0, 0, canvas.width, canvas.height)

        map.draw()

        for(let item of items) {
            if(item.carrier == null) {
                item.draw()
            }
        }

        for(let player of players) {
            player.draw()
        }

        for(let crate of crates) {
            crate.draw()
        }

        for(let player of players) {
            player.drawHud()
        }

        //displays pick up prompt
        if(players[0].gunInventory.length < 2) {
            for(let item of items) {
                if(item.carrier == null) {
                    if(getDist(players[0], item) < 110) {
                        g.fillStyle = "white"
                        g.font = "32px consolas"
                        g.fillText("Press [E] to pick up", (canvas.width/2)-155, 100)
                    }
                }
            }
        }
        

        for(let effect of particleEffects) {
            effect.update(g)
        }

    }

    frame++


}

animate();