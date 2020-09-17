function Bot(x, y, team, id) {

    this.id = id;

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

    this.hitColor = this.team

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

    this.findNearest = function(list) {
        let targetDist = getDistPos(this.pos, list[0].pos)
        let target = list[0]
        for(let player of list) {
            if(player.id != this.id) {
                if(targetDist > getDistPos(this.pos, player.pos)) {
                    targetDist = getDistPos(this.pos, player.pos)
                    target = player
                }
            }
        }
        return target
    }

    this.goTo = function(pos) {

        let targetPos = pos
        if(targetPos.x > this.pos.x) {
            this.input.right = true;
        } else if(targetPos.x < this.pos.x) {
            this.input.left = true;
        }
        if(targetPos.y > this.pos.y) {
            this.input.down = true;
        } else if(targetPos.y < this.pos.y) {
            this.input.up = true;
        }

    }

    this.aim = function() {
        let target = this.findNearest(players)
        let distX = target.pos.x - this.pos.x
        let distY = target.pos.y - this.pos.y
        let aimAngle = Math.atan2(distY, distX)*(180/Math.PI)
        this.aimAngle = aimAngle
    }

    this.behave = function() {
        this.aim()
        this.goTo(this.findNearest(players).pos)
    }

    this.update = function(offsetX, offsetY) {
        
        this.heldGun = this.gunInventory[this.heldSlot]

        this.behave()

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
        this.pos.x += this.vel.x;               this.pos.y += this.vel.y;

        this.pos.x -= offsetX;               this.pos.y -= offsetY;

        this.posOnMap = {
            x: this.pos.x-map.pos.x,
            y: this.pos.y-map.pos.y
        }

        console.log(this.input)

        this.input.right = false;
        this.input.left = false;
        this.input.down = false;
        this.input.up = false;

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
            //respawn
            let respawnX = 500; let respawnY = 100;
            this.pos.x -= this.posOnMap.x - respawnX; this.pos.y -= this.posOnMap.y - respawnY; 
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
        g.fillRect(this.pos.x-this.maxHealth/3, this.pos.y-40, this.maxHealth/1.5, 10)
        g.fillStyle = "green"
        g.fillRect(this.pos.x-this.maxHealth/3, this.pos.y-40, this.health/1.5, 10)
    }
}