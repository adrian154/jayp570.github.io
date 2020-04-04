

function Bot(x, y, color, flags, bases, healingStations, ID) {

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
    this.enemyTeam = null;
    this.fullHealth = 100;
    this.health = this.fullHealth;
    this.isCarrier = false;
    this.bullets = [];
    this.bulletsNum = 3;

    this.flags = flags;
    this.teamBase = bases[this.team];
    this.healingStations = healingStations;
    this.healing = false;
    for(let i in flags) {
        if(i != this.team) {
            this.enemyTeam = i;
            break;
        }
    }
    this.players = {
        "red": [],
        "blue": []
    }
    this.id = ID;

    this.setPlayers = function(players) {
        for(let i in players) {
            for(let j = 0; j < players[i].length; j++) {
                let player = players[i][j];
                if(player.getID() != this.id) {
                    this.players[player.getTeam()].push(player);
                }
            }
        }
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
            this.healing = false;
        }
    }

    this.shoot = function(mouseX,mouseY) {
        if(this.bulletsNum > 0) {
            this.bullets.push(new Bullet(this.pos.x,this.pos.y,mouseX,mouseY,this.team,this.id));
            this.bulletsNum--;
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

    this.findObject = function(flag) {
        this.leftIn = false;
        this.rightIn = false;
        this.upIn = false;
        this.downIn = false;
        let flagPos = {
            "x": flag.getPos().x,
            "y": flag.getPos().y
        }
        let xDist = flagPos.x-this.pos.x;
        let yDist = flagPos.y-this.pos.y;
        if(xDist < 0) {
            this.leftIn = true;
        }
        if(xDist > 0) {
            this.rightIn = true;
        }
        if(yDist < 0) {
            this.upIn = true;
        }
        if(yDist > 0) {
            this.downIn = true;
        }
    }

    this.findClosestPlayer = function(team) {
        let centerPos = {"x": this.pos.x+this.w/2, "y": this.pos.y+this.h/2};
        let minDistPlayer = {"dist": 100000, "player": null};
        for(let i in this.players) {
            for(let j = 0; j < this.players[i].length; j++) {
                let player = this.players[i][j];
                if(player.getTeam() === team) {
                    let playerCenterPos = {
                        "x": player.getPos().x+player.getW()/2,
                        "y": player.getPos().y+player.getH()/2
                    }
                    let dist = Math.sqrt(Math.pow(centerPos.x-playerCenterPos.x,2)+Math.pow(centerPos.y-playerCenterPos.y,2));
                    if(dist < minDistPlayer.dist) {
                        minDistPlayer.dist = dist;
                        minDistPlayer.player = player;
                    }
                }    
            }
        }
        return minDistPlayer;
    }

    this.avoid = function(team) {
        let distThreshhold = 400;
        let minDistPlayer = this.findClosestPlayer(team);
        if(minDistPlayer.dist < distThreshhold && minDistPlayer.player != null) {
            let directions = minDistPlayer.player.getDirections();
            
            if(directions.leftIn) {
                this.leftIn = false;
                this.rightIn = true;
            } else if(directions.rightIn) {
                this.rightIn = false;
                this.leftIn = true;
            }
            if(directions.upIn) {
                this.upIn = false;
                this.downIn = true;
            } else if(directions.downIn) {
                this.downIn = false;
                this.upIn = false;
            }
        }
    }

    this.checkFlagCarried = function(flag) {
        if(flag.getCarrier() != null) {
            return flag.getCarrier();
        }
        return null;
    }

    this.update = function(g) {
        ACCELERATION = defaultACC;
        if(this.isCarrier) {
            ACCELERATION = defaultACC/2;
        }
        this.acc.x = 0; this.acc.y = 0;
        this.w = 32; this.h = 32;

        //behavior
        
        if(this.isCarrier === false) {
            this.findObject(this.flags[this.enemyTeam]);
            if(this.health < 25) {
                this.healing = true;
            }
            if(this.checkFlagCarried(this.flags[this.team]) != null) {
                let enemyFlagCarrier = this.checkFlagCarried(this.flags[this.team]);
                let chance = Math.round(Math.random()*51+1);
                console.log(chance)
                this.findObject(enemyFlagCarrier);
                if(chance === 50) {
                    this.shoot(enemyFlagCarrier.getPos().x, enemyFlagCarrier.getPos().y)
                }
            }
            if(this.checkFlagCarried(this.flags[this.enemyTeam]) != null) {
                let closestEnemy = this.findClosestPlayer(this.enemyTeam).player;
                let chance = Math.round(Math.random()*51+1);
                this.findObject(closestEnemy);
                if(chance === 50) {
                    this.shoot(closestEnemy.getPos().x, closestEnemy.getPos().y)
                }
            }
        } 
        if(this.isCarrier) {
            this.findObject(this.teamBase);
            let closestEnemy = this.findClosestPlayer(this.enemyTeam).player;
            let chance = Math.round(Math.random()*51+1);
            if(chance === 50) {
                this.shoot(closestEnemy.getPos().x, closestEnemy.getPos().y)
            }
            this.avoid(this.enemyTeam);
        }
        if(this.healing) {
            this.findObject(this.healingStations[this.team]);
        }
        
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
            ammoDrops.push(new AmmoDrop(this.pos.x, this.pos.y));
            this.pos.x = this.spawnPos.x; 
            this.pos.y = this.spawnPos.y;
            this.health = this.fullHealth;
            this.bulletsNum = 3;
            this.healing = false;
            //this.isCarrier = false;
        }

        g.fillStyle = this.team;
        g.fillRect(this.pos.x,this.pos.y,this.w,this.h);
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
        g.fillStyle = "white";
        g.textAlign = "center";
        g.font = "20px Tahoma";
        g.fillText(this.id,this.pos.x+this.w/2,this.pos.y+this.h/2+8);
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
        return this.id;
    }

    this.getPlayers = function() {
        return this.players;
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