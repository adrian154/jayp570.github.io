class Projectile {

    constructor(imagePath, x, y, id, angle, speed, damage) {
        this.pos = {
            x: x,
            y: y
        }
        this.image = new Image()
        this.image.src = imagePath
    
        this.id = id
    
        this.angle = angle
        this.vel = {
            x: Math.cos(angle*(Math.PI/180))*speed,
            y: Math.sin(angle*(Math.PI/180))*speed
        }
    
        this.w = 7; this.h = 7;
    
        this.damage = damage
    
        this.particleEffects = []
    
        this.name = imagePath.substring(imagePath.indexOf("projectiles/")+"projectiles/".length, imagePath.indexOf(".png"))
    
        if(this.name == "rocket") {
            this.particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                effectVel: {x: this.vel.x, y: this.vel.y},
                angle: this.angle,
                particleAmount: 1,
                destroyTime: [0, 0],
                colors: ["#b1b1b1", "#7e7e7e"],
                fadeOut: 0.05,
                shrink: 0
            }, g))
            this.w = 43
            this.h = 19
        }
    }

    checkCollision(object) {
        let bX = object.pos.x;
        let bY = object.pos.y;
        let bW = object.w;
        let bH = object.h;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                angle: this.angle,
                continuous: false,
                effectWidth: 100,
                particleAmount: Math.round(getMagnitude(this.vel)),
                size: [5, 15],
                destroyTime: [0, 5],
                colors: [object.hitColor] 
            }, g))
            return true;
        }
        return false;
    }

    checkCollisionPlayer(object) {
        let bX = object.pos.x-object.size/2;
        let bY = object.pos.y-object.size/2;
        let bW = object.size*2;
        let bH = object.size*2;
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.w;
        let h = this.h;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            particleEffects.push(new ParticleEffect(this.pos.x, this.pos.y, {
                angle: this.angle,
                continuous: false,
                effectWidth: 100,
                particleAmount: Math.round(getMagnitude(this.vel)),
                size: [5, 15],
                destroyTime: [0, 5],
                colors: [object.hitColor] 
            }, g))
            return true;
        }
        return false;
    }

    update(offsetX, offsetY) {
        this.pos.x += this.vel.x; this.pos.y += this.vel.y;
        this.pos.x -= offsetX; this.pos.y -= offsetY;
        for(let effect of this.particleEffects) {
            effect.pos.x -= offsetX
            effect.pos.y -= offsetY
            for(let particle of effect.particles) {
                particle.pos.x -= offsetX
                particle.pos.y -= offsetY
            }
        }
    }

    draw() {
        g.translate(this.pos.x, this.pos.y)
        g.rotate(this.angle*Math.PI/180)
        g.drawImage(this.image, -this.image.width+this.w, -this.image.height+this.h)
        g.rotate(-this.angle*Math.PI/180)
        g.translate(-this.pos.x, -this.pos.y)
        for(let effect of this.particleEffects) {
            effect.update()
        }
    }

}


class Grenade extends Projectile{

    constructor(imagePath, x, y, id, angle, speed, damage) {
        super(imagePath, x, y, id, angle, speed, damage)
        this.acc = {
            "x": 0,
            "y": 0
        }
        this.w = 22
        this.h = 26
        this.timer = 0
    }

    update(offsetX, offsetY) {
        this.acc.x = 0; this.acc.y = 0;
        this.acc.x += this.vel.x * FRICTION/3; this.acc.y += this.vel.y * FRICTION/3;
        this.vel.x += this.acc.x; this.vel.y += this.acc.y;
        super.update(offsetX, offsetY)
        this.timer++;
    }

}
                                                                            

function explode(bullet, explosionForce) {
    for(let crateBlasted of crates) {
        if(getDist(crateBlasted, bullet) < 140) {
            crateBlasted.health -= 50
            let xDist = crateBlasted.pos.x+crateBlasted.w/2-bullet.pos.x
            let yDist = crateBlasted.pos.y+crateBlasted.h/2-bullet.pos.y
            let angle = Math.atan2(yDist, xDist)
            crateBlasted.vel.x += Math.cos(angle)*explosionForce*(2/3)
            crateBlasted.vel.y += Math.sin(angle)*explosionForce*(2/3)
        }
    }
    for(let playerBlasted of players) {
        if(getDist(playerBlasted, bullet) < 170) {
            playerBlasted.health -= 50
            if(playerBlasted.id == bullet.id) {
                playerBlasted.health+=20
            }
            let xDist = playerBlasted.pos.x+playerBlasted.size/2-bullet.pos.x
            let yDist = playerBlasted.pos.y+playerBlasted.size/2-bullet.pos.y
            let angle = Math.atan2(yDist, xDist)
            playerBlasted.vel.x += Math.cos(angle)*explosionForce
            playerBlasted.vel.y += Math.sin(angle)*explosionForce
        }
    }
}