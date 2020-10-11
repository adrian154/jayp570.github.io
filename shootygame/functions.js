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

function getCollisionAngle(objA, objB) {
    let tileCenterPos = {
        x: objA.pos.x+objA.w/2,
        y: objA.pos.y+objA.h/2
    }
    let distX = tileCenterPos.x-objB.pos.x
    let distY = tileCenterPos.y-objB.pos.y
    let collisionAngle = Math.atan2(-distY, distX)*(180/Math.PI)
    if(collisionAngle < 0) {
        collisionAngle+=360 
    }
    collisionAngle = Math.round(collisionAngle)
    return collisionAngle;  
}

function addKillToPlayer(id) {
    for(let player of players) {
        if(player.id == id)  {
            player.kills++;
        }
    }
}