let canvas = document.querySelector("canvas");

canvas.width = 1900;
canvas.height = 800;

let g = canvas.getContext("2d");

let dim = 10;
const TILESIZE = 800/dim;

let showRays = false;
function toggleRays() {
    showRays = !showRays;
}

function Tile(x, y, num) {
    this.num = num;
    this.size = TILESIZE;
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

let mapTemplate = [];
for(let i = 0; i < dim; i++) {
    mapTemplate.push([]);
    for(let j = 0; j < dim; j++) {
        if(i == 0 || j == 0 || i == dim-1 || j == dim-1) {
            mapTemplate[i].push(1);
        } else {
            mapTemplate[i].push(0);
        }
    }
}

let map = [];

function makeMap() {
    for(let i = 0; i < mapTemplate.length; i++) {
        map.push([]);
        for(let j = 0; j < mapTemplate[i].length; j++) {
            map[i].push(new Tile(j*TILESIZE, i*TILESIZE, mapTemplate[i][j]));
        }
    }
}

makeMap();


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
    "y": 400
}

let playerSpeed = 5;

let playerLookAngle = 45;
let playerDeltaPos = {
    "x": Math.cos(playerLookAngle)*playerSpeed,
    "y": Math.sin(playerLookAngle)*playerSpeed
}
let lookLeftIn = false;
let lookRightIn = false;

let leftIn = false;
let rightIn = false;
let upIn = false;
let downIn = false;

let FOV = 89;



function updatePlayer() {
    playerDeltaPos = {
        "x": Math.cos(playerLookAngle)*playerSpeed,
        "y": Math.sin(playerLookAngle)*playerSpeed
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

function drawRays(draw) {
    g.strokeStyle = "green";
    let cameraAngle = (playerLookAngle-((FOV/2)*Math.PI/180))
    let rayAngle = cameraAngle;
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
            if(draw) {
                g.beginPath();
                g.moveTo(pos.x, pos.y);
                g.lineTo(pos.x+Math.cos(rayAngle), pos.y+Math.sin(rayAngle));
                g.stroke();
            }
            for(let j = 0; j < map.length; j++) {
                for(let k = 0; k < map[j].length; k++) {
                    if(map[j][k].num == 1) {
                        if(map[j][k].checkCollision(pos.x, pos.y, 1, 1)) {
                            hitWall = true;
                            lengths.push(length*(Math.cos(rayAngle-playerLookAngle)));
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
        case 87: upIn = true; break;
        case 83: downIn = true; break;
        case 65: lookLeftIn = true; break;
        case 68: lookRightIn = true; break;
        default: ;
    }
}
function keyUpHandler(e) {
    let code = e.keyCode;
    switch(code) {
        case 87: upIn = false; break;
        case 83: downIn = false; break;
        case 65: lookLeftIn = false; break;
        case 68: lookRightIn = false; break;
        default: ;
    }
}

window.addEventListener("mousedown", mouseDownHandler, false);
function mouseDownHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    if(mouseX < 800 && mouseY < 800) {
        for(let i = 0; i < map.length; i++) {
            for(let j = 0; j < map[i].length; j++) {
                if(map[i][j].checkCollision(mouseX, mouseY, 0, 0)) {
                    if(mapTemplate[i][j] == 1) {
                        mapTemplate[i][j] = 0;
                    } else {
                        mapTemplate[i][j] = 1;
                    }
                    map = []
                    makeMap();
                }
            }
        }
    }
}

function drawScreen() {
    g.fillStyle = "gray"
    g.fillRect(800, 0, canvas.width-800, canvas.height);
    g.fillStyle = "skyblue"
    g.fillRect(800, 0, canvas.width-800, canvas.height/2);
    for(let i = 0; i < lengths.length; i++) {
        let red = (255-lengths[i]/2)
        let green = (255-lengths[i]/2)
        let blue = 0
        let color = "rgb("+red+","+green+","+blue+")"
        let w = ((canvas.width-800)/FOV)+2
        let h = (55000/lengths[i]);
        let y = 400-(h/2);
        let x = 800+(i*(w-2));
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
    drawRays(showRays);
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
