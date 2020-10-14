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

function getTileOf(obj) {
    let tile = map.map[0][0]
    for(let i = 0; i < map.map.length; i++) {
        for(let j = 0; j < map.map[i].length; j++) {
            if(getDistPos(obj.pos, map.map[i][j].getCenterPos()) < getDistPos(obj.pos, tile.getCenterPos())) {
                tile = map.map[i][j]
            }
        }
    }
    return tile
}

function getRandomSpawnPos(map) {
    let validPos = false;
    let x = null
    let y = null
    while(validPos == false) {
        x = getRandomNum(map.pos.x, map.pos.x+map.w-100)
        y = getRandomNum(map.pos.y, map.pos.y+map.h-100)
        for(let i = 0; i < map.map.length; i++) {
            for(let j = 0; j < map.map[i].length; j++) {
                mapTile = map.map[i][j]
                if(x < mapTile.pos.x+mapTile.w && x > mapTile.pos.x && y < mapTile.pos.y+mapTile.h && y > mapTile.pos.y) {
                    tile = map.map[i][j]
                } 
            }
        }
        if(tile.state == 0) {
            validPos = true
        } else {
            validPos = false
        }
    }
    return {x: x, y: y}
}