let canvas = document.querySelector("canvas");

canvas.width = 1900;
canvas.height = 800;

let g = canvas.getContext("2d");

function Tile(x, y, num) {
    this.num = num;
    this.size = 100;
    this.pos = {
        "x": x,
        "y": y
    }
    this.checkCollision = function(bX, bY, bW, bH) {
        let x = this.pos.x;
        let y = this.pos.y;
        let w = this.size;
        let h = this.size;
        if(x < bX+bW && x+w > bX && y < bY+bH && y+h > bY) {
            return true;
        }
        return false;
    }
    this.draw = function() {
        if(num == 1) {
            g.fillStyle = "white"
        } else {
            g.fillStyle = "black"
        }
        g.fillRect(this.pos.x+1, this.pos.y+1, this.size-1, this.size-1);
    }
}

let mapTemplate = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

let map = [];

for(let i = 0; i < mapTemplate.length; i++) {
    map.push([]);
    for(let j = 0; j < mapTemplate[i].length; j++) {
        map[i].push(new Tile(j*100, i*100, mapTemplate[i][j]));
    }
}

let tileWidth = 100;
let tileHeight = 100;

function drawMap() {
    g.fillStyle = "gray"
    g.fillRect(0, 0, 800, canvas.height);
    for(let i = 0; i < map.length; i++) {
        for(let j = 0; j < map[i].length; j++) {
            map[i][j].draw();
        }
    }
}

let playerPos = {
    "x": 400,
    "y": 300
}

let playerLookAngle = 0;
let playerDeltaPos = {
    "x": Math.cos(playerLookAngle)*5,
    "y": Math.sin(playerLookAngle)*5
}
let lookLeftIn = false;
let lookRightIn = false;

let playerSpeed = 2;

let leftIn = false;
let rightIn = false;
let upIn = false;
let downIn = false;

let FOV = 100;



function updatePlayer() {
    playerDeltaPos = {
        "x": Math.cos(playerLookAngle)*3,
        "y": Math.sin(playerLookAngle)*3
    }
    if(upIn) {playerPos.y+=playerDeltaPos.y; playerPos.x+=playerDeltaPos.x}
    if(downIn) {playerPos.y-=playerDeltaPos.y; playerPos.x-=playerDeltaPos.x}
    if(lookLeftIn) {
        playerLookAngle-=0.1; 
        if(playerLookAngle < 0) {
            playerLookAngle+=2*Math.PI
        }
    }
    if(lookRightIn) {
        playerLookAngle+=0.1; 
        if(playerLookAngle > 2*Math.PI) {
            playerLookAngle-=2*Math.PI
        }
    }
}

function drawPlayer() {
    g.fillStyle = "red"
    g.fillRect(playerPos.x, playerPos.y, 10, 10);
}

let lengths = [];

function drawRays() {
    g.strokeStyle = "green";
    let rayAngle = playerLookAngle;
    for(let i = -FOV/2; i < FOV/2; i++) {
        rayAngle+=Math.PI/180;
        if(rayAngle > 2*Math.PI) {
            rayAngle-=2*Math.PI
        }
        if(rayAngle < 0) {
            rayAngle+=2*Math.PI
        }
        let length = 0;
        let hitWall = false;
        let pos = {
            "x": playerPos.x+5,
            "y": playerPos.y+5
        }
        while(hitWall == false) {
            g.beginPath();
            g.moveTo(pos.x, pos.y);
            g.lineTo(pos.x+Math.cos(rayAngle), pos.y+Math.sin(rayAngle));
            g.stroke();
            for(let j = 0; j < map.length; j++) {
                for(let k = 0; k < map[j].length; k++) {
                    if(map[j][k].num == 1) {
                        if(map[j][k].checkCollision(pos.x, pos.y, 1, 1)) {
                            hitWall = true;
                            lengths.push(length);
                            break;
                        }
                    }
                }
            }
            if(hitWall == false) {
                length++;
                pos = {
                    "x": pos.x+Math.cos(rayAngle),
                    "y": pos.y+Math.sin(rayAngle)
                }
            }
        }
    }
}

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);
function keyDownHandler(e) {
    let code = e.keyCode;
    switch(code) {
        case 65: leftIn = true; break;
        case 87: upIn = true; break;
        case 68: rightIn = true; break;
        case 83: downIn = true; break;
        case 37: lookLeftIn = true; break;
        case 39: lookRightIn = true; break;
        default: ;
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    switch(code) {
        case 65: leftIn = false; break;
        case 87: upIn = false; break;
        case 68: rightIn = false; break;
        case 83: downIn = false; break;
        case 37: lookLeftIn = false; break;
        case 39: lookRightIn = false; break;
        default: ;
    }
}

function drawScreen() {
    g.fillStyle = "gray"
    g.fillRect(800, 0, canvas.width-800, canvas.height);
    for(let i = 0; i < lengths.length; i++) {
        let color = "rgb(0,"+(255-lengths[i]/2)+","+(255-lengths[i]/2)+")"
        let w = ((canvas.width-800)/FOV)
        let h = 700-lengths[i];
        let y = 400-(h/2);
        let x = 800+(i*w);
        g.fillStyle = color;
        g.fillRect(x, y, w, h);
    }
}

function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawScreen();
    updatePlayer();
    drawPlayer();
    drawRays();
    for(let i = 0; i < lengths.length; i++) {
        lengths.shift();
    }
    g.strokeStyle = "red"
    g.beginPath();
    g.moveTo(playerPos.x+5, playerPos.y+5);
    g.lineTo(playerPos.x+playerDeltaPos.x*25, playerPos.y+playerDeltaPos.y*25);
    g.stroke();
    console.log(playerLookAngle);
    
}

animate();
