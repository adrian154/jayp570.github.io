let canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 1200;
canvas.height = 800;

let g = canvas.getContext('2d');

let image = g.createImageData(canvas.width, canvas.height);
let data = image.data;

let size = 6;

function Tile(x, y, size, name) {
    this.size = size;
    this.pos = {
        "x": x,
        "y": y
    }
    this.name = name;
    this.draw = function(g) {
        switch (this.name) {
            case "water":
                g.fillStyle = "rgb(5, 179, 244)";
                break;

            case "sand":
                g.fillStyle = "rgb(240, 230, 140)";
                break;

            case "grass":
                g.fillStyle = "rgb(90, 205, 0)";
                break;

            default:
                g.fillStyle = "white";
                break;
        }
        g.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    }
}

let map = [];
let waterLevel = 20;
let sandThreshhold = 30;

noise.seed(Math.random());
//noise.seed(0.129841972);
for (let x = 0; x < canvas.width; x+=size) {
    map.push([]);
    for (let y = 0; y < canvas.height; y+=size) {
        let value = noise.perlin2(x /100, y /100);
        value *= 300;
        //console.log(value);
        //map[x/size].push(null);
        if(value < waterLevel) {
            map[x/size].push(new Tile(x, y, size, "water")); //water
        } else if(value >= waterLevel && value <= waterLevel+sandThreshhold){
            map[x/size].push(new Tile(x, y, size, "sand")); //sand
        } else {
            map[x/size].push(new Tile(x, y, size, "grass")); //grass
        }
        let cell = (x + y * canvas.width) * 4;
        data[cell] = data[cell + 1] = data[cell + 2] = value;
        data[cell] += Math.max(0, (25 - value) * 8);
        data[cell + 3] = 255; // alpha.
    }
}
console.log(map);

g.putImageData(image, 0, 0);



function animate() {
    requestAnimationFrame(animate);
    g.clearRect(0,0,canvas.width,canvas.height);
    console.log(map.length, map[0].length);
    for(let i = 0; i < map.length; i++) {
        for(let j = 0; j < map[i].length; j++) {
            if(map[i][j] != null) {map[i][j].draw(g);}
        }
    }
}

animate();

